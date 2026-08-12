from pydantic import BaseModel
from typing import Optional, List

class IngestRequest(BaseModel):
    file_content: str  
    filename: str
    project_id: int
    document_id: int
    user_id: int

class TaskGenerationRequest(BaseModel):
    document_id: int
    project_id: int
    query: Optional[str] = None

class TaskResponse(BaseModel):
    title: str
    description: str
    priority: str
    estimated_hours: Optional[int] = None
    due_date: Optional[str] = None

class IngestResponse(BaseModel):
    status: str
    document_id: int
    chunks_count: int
    tasks_generated: int
    tasks: List[TaskResponse]