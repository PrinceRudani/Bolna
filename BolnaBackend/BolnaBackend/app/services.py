import json
import requests
from datetime import datetime
from app.config import settings
from app.database import get_connection


def get_bolna_headers():
    """
    Get proper headers for Bolna API requests.
    Uses API key as Bearer token directly.
    """
    if not settings.BOLNA_API_KEY:
        raise ValueError("BOLNA_API_KEY is not configured in .env file")
    
    return {
        "Authorization": f"Bearer {settings.BOLNA_API_KEY}",
        "Content-Type": "application/json"
    }


def get_bolna_bearer_token():
    """
    Return the Bolna API key (used directly as Bearer token).
    No authentication call needed - API key is the token.
    """
    if not settings.BOLNA_API_KEY:
        raise ValueError("BOLNA_API_KEY is not configured in .env file")
    return settings.BOLNA_API_KEY



def fetch_from_bolna(payload: dict):
    """
    Fetch metrics from Bolna API using bearer token.
    
    Args:
        payload: dict with keys - agent_id, from_date, to_date, page_number, page_size
    """
    url = f"{settings.BOLNA_BASE_URL}/agent/{payload['agent_id']}/metrics"

    response = requests.post(
        url,
        headers=get_bolna_headers(),
        json={
            "agent_id": payload["agent_id"],
            "from": payload["from_date"].isoformat(),
            "to": payload["to_date"].isoformat(),
            "page_number": payload["page_number"],
            "page_size": payload["page_size"]
        }
    )

    response.raise_for_status()
    return response.json()

def call_gemini_with_summary(summary: str) -> dict:
    """
    Send a call summary to Gemini 2.0 Flash and return a structured JSON dict.
    """
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": (
                            "You are an assistant for a municipal helpline analytics system.\n"
                            "Given a call summary, extract and return ONLY a JSON object with this exact structure:\n"
                            "{\n"
                            '  "reporter": {"name": "...", "phone": "..."},\n'
                            '  "area": "...",\n'
                            '  "complaint_type": "...",\n'
                            '  "transcript": "...",\n'
                            '  "assigned_to": "...",\n'
                            '  "created_at": "ISO-8601 timestamp",\n'
                            '  "related_execution_id": "..." \n'
                            "}\n"
                            "Rules:\n"
                            "- Respond with valid JSON only (no extra text, no explanations).\n"
                            "- Always respond in English. If the input is in another language, translate it into English first before extracting.\n"
                            "- Do NOT include any Gujarati, Hindi, or other non-English text in the output.\n"
                            "- If any field is unknown, still include it with a best-effort guess or null.\n\n"
                            f"Call summary:\n{summary}"
                        )
                    }
                ]
            }
        ]
    }

    # Debug/diagnostic prints (remove or disable in production)
    print("[gemini] GEMINI_API_KEY set:", bool(settings.GEMINI_API_KEY))
    print("[gemini] Request payload (truncated):", str(payload)[:800])

    params = {"key": settings.GEMINI_API_KEY}
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, params=params, headers=headers, json=payload)

    print("[gemini] HTTP status:", response.status_code)
    print("[gemini] Response text (truncated):", response.text[:1200])

    response.raise_for_status()
    data = response.json()

    try:
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise RuntimeError("Unexpected response format from Gemini API")

    # Try to parse the response as JSON directly first.
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Gemini might wrap JSON in markdown fences or prose; try to extract the JSON object.
        # Strip markdown code fences like ```json ... ``` if present.
        if text.startswith("```"):
            # Remove first fence and optional language tag
            parts = text.split("```")
            if len(parts) >= 3:
                # content between first and second fence
                inner = parts[1]
                # drop leading language identifier if present (e.g. "json\n")
                inner = inner.lstrip()
                if "\n" in inner:
                    inner = inner.split("\n", 1)[1]
                text = inner.strip()

        # Fallback: take substring between first '{' and last '}'.
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start : end + 1]
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                pass

        raise RuntimeError("Gemini response was not valid JSON")


def store_ai_summary(ai_data: dict):
    """
    Store a structured AI summary into the ai_summary table.

    Avoid creating duplicate rows when the same execution is processed multiple times.
    If `related_execution_id` is provided, we treat it as a natural key and avoid
    inserting a second row for the same execution.
    """
    connection = get_connection()
    cursor = connection.cursor()

    try:
        reporter = ai_data.get("reporter") or {}

        created_at_value = ai_data.get("created_at")
        created_at = None
        if created_at_value:
            # Handle possible trailing 'Z'
            created_at = datetime.fromisoformat(created_at_value.replace("Z", ""))

        related_execution_id = ai_data.get("related_execution_id")
        if related_execution_id:
            cursor.execute(
                "SELECT 1 FROM ai_summary WHERE related_execution_id = %s LIMIT 1",
                (related_execution_id,),
            )
            if cursor.fetchone():
                # Already stored for this execution; avoid duplicates.
                return

        query = """
        INSERT INTO ai_summary (
            reporter_name,
            reporter_phone,
            area,
            complaint_type,
            transcript,
            assigned_to,
            created_at,
            related_execution_id
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """

        cursor.execute(
            query,
            (
                reporter.get("name"),
                reporter.get("phone"),
                ai_data.get("area"),
                ai_data.get("complaint_type"),
                ai_data.get("transcript"),
                ai_data.get("assigned_to"),
                created_at,
                related_execution_id,
            ),
        )

        connection.commit()

    finally:
        cursor.close()
        connection.close()


def store_executions(agent_id: str, executions: list):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        for row in executions:
            telephony = row.get("telephony_data", {})
            custom_extractions = row.get("custom_extractions", {}) or {}
            extracted_data = row.get("extracted_data", {}) or {}

            # Token comes from Department_Ticket in custom_extractions
            token = custom_extractions.get("Department_Ticket")
            if token == "NULL":
                token = None

            # Department comes from assigned_department in extracted_data
            department = extracted_data.get("assigned_department")

            query = """
            INSERT INTO call_executions (
                id, agent_id, user_number,
                call_type, duration, hangup_by,
                status, transcript, summary, token, department, recording_url,
                created_at
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON DUPLICATE KEY UPDATE
                duration = VALUES(duration),
                status = VALUES(status),
                transcript = VALUES(transcript),
                summary = VALUES(summary),
                token = VALUES(token),
                department = VALUES(department)
            """

            created_at = None
            if row.get("created_at"):
                created_at = datetime.fromisoformat(
                    row["created_at"].replace("Z", "")
                )
            cursor.execute(query, (
                row.get("id"),
                agent_id,
                row.get("user_number"),
                telephony.get("call_type"),
                telephony.get("duration"),
                telephony.get("hangup_by"),
                row.get("status"),
                row.get("transcript"),
                row.get("summary"),          # summary from the API
                token,                       # Department_Ticket -> token
                department,                  # assigned_department -> department
                telephony.get("recording_url"),
                created_at,
            ))

        connection.commit()

    finally:
        cursor.close()
        connection.close()


def get_all_ai_summaries(page_number: int = 1, page_size: int = 50):
    connection = get_connection()
    cursor = connection.cursor()

    try:
        query = """
        SELECT
            a.id,
            a.reporter_name,
            a.reporter_phone,
            a.area,
            a.complaint_type,
            a.transcript,
            a.assigned_to,
            a.created_at,
            a.related_execution_id,
            a.inserted_at,
            ce.status AS call_status,
            ce.user_number AS call_user_number
        FROM ai_summary AS a
        LEFT JOIN call_executions AS ce
        ON ce.id = a.related_execution_id
        ORDER BY a.inserted_at DESC, a.id DESC
        LIMIT %s OFFSET %s
        """

        offset = (page_number - 1) * page_size

        cursor.execute(query, (page_size, offset))
        rows = cursor.fetchall()

        return rows

    finally:
        cursor.close()
        connection.close()


def get_ai_summaries_by_department(department: str, page_number: int = 1, page_size: int = 50):

    connection = get_connection()
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    try:
        query = """
        SELECT
            a.id,
            a.reporter_name,
            a.reporter_phone,
            a.area,
            a.complaint_type,
            a.transcript,
            a.assigned_to,
            a.created_at,
            a.related_execution_id,
            a.inserted_at,
            ce.status AS call_status,
            ce.user_number AS call_user_number
        FROM ai_summary AS a
        LEFT JOIN call_executions AS ce
            ON ce.id = a.related_execution_id
        WHERE a.complaint_type LIKE %s
        ORDER BY a.inserted_at DESC, a.id DESC
        LIMIT %s OFFSET %s
        """

        offset = (page_number - 1) * page_size
        search_pattern = f"%{department}%"

        cursor.execute(query, (search_pattern, page_size, offset))
        rows = cursor.fetchall()
        return rows

    finally:
        cursor.close()
        connection.close()

def fetch_department_counts():

    connection = get_connection()
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    try:

        query = """
        SELECT 
            department,
            COUNT(*) AS total_complaints
        FROM (
            SELECT
                CASE
                    WHEN complaint_type LIKE '%water%' THEN 'Water'
                    WHEN complaint_type LIKE '%streetlight%' THEN 'Streetlights'
                    WHEN complaint_type LIKE '%animal%' THEN 'Animals'
                    WHEN complaint_type LIKE '%trash%' OR complaint_type LIKE '%garbage%' THEN 'Garbage'
                    WHEN complaint_type LIKE '%pothole%' OR complaint_type LIKE '%road%' THEN 'Roads'
                    ELSE 'Other'
                END AS department
            FROM ai_summary
        ) AS categorized
        GROUP BY department
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        response = []

        for row in rows:
            department = row["department"]
            total = row["total_complaints"]

            response.append({
                "id": department,
                "name": department,
                "total": total,
                "resolved": "--",
                "inProgress": "--",
                "open": total
            })

        return response

    finally:
        cursor.close()
        connection.close()       
        
def get_call_history(agent_id=None, from_date=None, to_date=None, page_number=1, page_size=20):
    """
    Fetch call executions with optional filters.
    """
    connection = get_connection()
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    try:
        query = """
        SELECT
            id, agent_id, user_number, call_type, duration, hangup_by,
            status, transcript, summary, token, department, recording_url,
            created_at
        FROM call_executions
        WHERE 1=1
        """
        params = []

        if agent_id:
            query += " AND agent_id = %s"
            params.append(agent_id)

        if from_date:
            query += " AND created_at >= %s"
            params.append(from_date)

        if to_date:
            query += " AND created_at <= %s"
            params.append(to_date)

        query += " ORDER BY created_at DESC"

        # Pagination
        offset = (page_number - 1) * page_size
        query += " LIMIT %s OFFSET %s"
        params.extend([page_size, offset])

        cursor.execute(query, params)
        rows = cursor.fetchall()
        return rows

    finally:
        cursor.close()
        connection.close()


def get_complaint_by_token(token: str):
    connection = get_connection()
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    try:
        query = "SELECT token, user_number as phone FROM call_executions WHERE token = %s LIMIT 1"
        cursor.execute(query, (token,))
        complaint = cursor.fetchone()

        if not complaint:
            raise Exception("Phone number not found for this token")

        return complaint

    finally:
        cursor.close()
        connection.close()

import pymysql
from app.database import get_connection


def get_user_by_agent_id(agent_id: str):
    connection = get_connection()
    cursor = connection.cursor(pymysql.cursors.DictCursor)

    try:
        query = "SELECT agent_id, user_number FROM call_executions WHERE agent_id = %s LIMIT 1"
        cursor.execute(query, (agent_id,))
        record = cursor.fetchone()

        if not record:
            raise Exception("No record found for this agent_id")

        return record

    finally:
        cursor.close()
        connection.close()