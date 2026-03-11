from fastapi import FastAPI, HTTPException, Request
import requests
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import SyncRequest, CallRequest, ResolutionCallRequest, GeminiSummaryRequest, CallHistoryRequest, DepartmentRequest
from app.services import (
    fetch_department_counts,
    fetch_from_bolna,
    store_executions,
    get_all_ai_summaries,
    call_gemini_with_summary,
    store_ai_summary,
    get_complaint_by_token,
    get_bolna_bearer_token,
    get_bolna_headers,
    get_call_history,
    get_ai_summaries_by_department
)
from app.voice_agent import make_resolution_call

app = FastAPI(title="Bolna Sync Service")

# Allow frontend (Vite dev server) to call this API
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://13.203.39.153",
    "https://l8vc9g1h-5173.inc1.devtunnels.ms"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/sync")
def sync_data(request: SyncRequest):
    try:
        payload = request.dict()

        api_response = fetch_from_bolna(payload)
        executions = api_response.get("data", {}).get("executions", [])

        store_executions(request.agent_id, executions)

        return {
            "status": "success",
            "records_synced": len(executions)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/CallHistory")
async def call_history(request: CallHistoryRequest, raw_request: Request):
    """
    Fetch call history with optional filters.
    Returns list of call executions.

    This endpoint can also be used by Bolna to post a single execution record.
    When a payload includes a transcript, we store the execution and run
    a Gemini extraction pipeline (stored into `ai_summary`).
    """
    try:
        raw_body = await raw_request.json()

        agent_id = request.agent_id or raw_body.get("agent_id")

        # Persist call execution for later display/storage.
        # This is safe to call even when the payload is a lightweight query
        # (it will simply no-op if there is no `id` in the payload).
        if agent_id and raw_body.get("id"):
            try:
                store_executions(agent_id, [raw_body])
            except Exception:
                # Do not block the endpoint if DB writes fail.
                pass

        transcript = raw_body.get("transcript")
        if transcript:
            try:
                ai_data = call_gemini_with_summary(transcript)

                # Make sure we can relate the AI summary back to the execution
                # record (when available).
                if raw_body.get("id"):
                    ai_data["related_execution_id"] = raw_body.get("id")

                store_ai_summary(ai_data)
            except Exception:
                # Gemini / DB failures should not break this endpoint.
                pass

        data = get_call_history(
            agent_id=agent_id,
            from_date=request.from_date,
            to_date=request.to_date,
            page_number=request.page_number,
            page_size=request.page_size
        )

        return {
            "status": "success",
            "data": data,
            "page_number": request.page_number,
            "page_size": request.page_size
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/call")
def call_user(request: CallRequest):
    try:
        # Get phone number from token
        complaint = get_complaint_by_token(request.token)
        phone_number = complaint.get("phone")
        
        if not phone_number:
            raise HTTPException(status_code=404, detail="Phone number not found for this token")
        
        call_sid = make_resolution_call(phone_number)

        return {
            "status": "calling",
            "call_sid": call_sid,
            "phone_number": phone_number
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/resolve-call")
def resolution_call(request: ResolutionCallRequest):
    try:
        call_sid = make_resolution_call(request.agent_id)

        return {
            "status": "calling",
            "call_sid": call_sid
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ai-summary")
def list_ai_summary():
    """
    Return all AI summaries stored in the ai_summary table.
    """
    try:
        return get_all_ai_summaries()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai-summary-by-department")
def ai_summary_by_department(payload: DepartmentRequest):
    """
    Return AI summaries filtered by department.
    If department = 'all', return all records.
    """

    try:
        print(f"Fetching AI summaries for department: {payload.department}, page: {payload.page_number}, size: {payload.page_size}")    
        if payload.department == "All Department":
            return get_all_ai_summaries(
                payload.page_number,
                payload.page_size
            )

        return get_ai_summaries_by_department(
            payload.department,
            payload.page_number,
            payload.page_size
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/department-counts")
def get_department_counts():
    try:
        return fetch_department_counts()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        

@app.post("/gemini-summary")
def gemini_summary(request: GeminiSummaryRequest):
    """
    Manually send a summary to Gemini and store + return the AI summary.
    """
    try:
        ai_data = call_gemini_with_summary(request.summary)
        store_ai_summary(ai_data)
        return {"ai_summary": ai_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/internal/bolna-login")
def bolna_login():
    """
    Verify Bolna API key is valid.
    Returns the API key status and base endpoint.
    """
    try:
        api_key = get_bolna_bearer_token()
        
        return {
            "status": "success",
            "message": "Bolna API key is configured and ready",
            "api_key_configured": bool(api_key),
            "base_url": settings.BOLNA_BASE_URL
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agents/all")
def get_all_agents():
    """
    Get all agents from Bolna API.
    Status 200 means API key is valid.
    """
    try:
        url = f"{settings.BOLNA_BASE_URL}/agent/all"
        response = requests.get(url, headers=get_bolna_headers())
        response.raise_for_status()
        
        return {
            "status": "success",
            "data": response.json()
        }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid or expired API key")
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agents/create")
def create_agent(name: str, language: str = "en", voice: str = "female", prompt: str = ""):
    """
    Create a new agent in Bolna.
    """
    try:
        url = f"{settings.BOLNA_BASE_URL}/agent/create"
        
        payload = {
            "name": name,
            "language": language,
            "voice": voice,
            "prompt": prompt
        }
        
        response = requests.post(url, headers=get_bolna_headers(), json=payload)
        response.raise_for_status()
        
        return {
            "status": "success",
            "data": response.json()
        }
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calls/make")
def make_call(agent_id: str, phone_number: str):
    """
    Make an outbound call using a Bolna agent.
    """
    try:
        url = f"{settings.BOLNA_BASE_URL}/calls/make"
        
        payload = {
            "agent_id": agent_id,
            "to_number": phone_number
        }
        
        response = requests.post(url, headers=get_bolna_headers(), json=payload)
        response.raise_for_status()
        
        return {
            "status": "success",
            "data": response.json()
        }
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/executions/{execution_id}")
def get_execution(execution_id: str):
    """
    Get execution/call result from Bolna.
    Returns call transcript, metadata, and outcome.
    """
    try:
        url = f"{settings.BOLNA_BASE_URL}/executions/get_execution"
        
        params = {"execution_id": execution_id}
        
        response = requests.get(url, headers=get_bolna_headers(), params=params)
        response.raise_for_status()
        
        return {
            "status": "success",
            "data": response.json()
        }
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
