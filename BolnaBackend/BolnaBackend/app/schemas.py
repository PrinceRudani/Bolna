from pydantic import BaseModel
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str

class SyncRequest(BaseModel):
    agent_id: str
    from_date: datetime
    to_date: datetime
    page_number: int = 1
    page_size: int = 20


class DepartmentRequest(BaseModel):
    department: str
    page_number: int = 1
    page_size: int = 50
    
class CallRequest(BaseModel):
    token: str  # User's unique token to lookup phone number


class ResolutionCallRequest(BaseModel):
    agent_id: str


class GeminiSummaryRequest(BaseModel):
    summary: str

class MetricsRequest(BaseModel):
    agent_id: str
    from_date: str  # ISO 8601 format: "2026-02-24T18:30:00.000Z"
    to_date: str    # ISO 8601 format: "2026-03-04T18:29:59.999Z"
    page_number: int = 1
    page_size: int = 20
    bearer_token: str = None  # Optional: provide if you have a token

class CallHistoryRequest(BaseModel):
    agent_id: str = None
    from_date: str = None  # ISO 8601 format
    to_date: str = None    # ISO 8601 format
    page_number: int = 1
    page_size: int = 20