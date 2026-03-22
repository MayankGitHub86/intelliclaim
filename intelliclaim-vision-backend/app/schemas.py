from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    company: Optional[str] = None
    role: Optional[str] = "user"
    picture: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str
    email: str
    name: str
    picture: Optional[str] = None

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[str] = None

# Claim Schemas
class ClaimBase(BaseModel):
    title: str
    description: str
    amount: Optional[float] = None

class ClaimCreate(ClaimBase):
    pass

class ClaimResponse(ClaimBase):
    id: str
    status: str
    confidence_score: Optional[float] = None
    ai_decision: Optional[str] = None
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Document Schemas
class DocumentAnalysis(BaseModel):
    document_id: str
    query: str
    document_type: Optional[str] = "insurance_claim"
    context: Optional[str] = None

class DocumentResponse(BaseModel):
    id: str
    filename: str
    content_type: str
    size: int
    created_at: datetime
    analysis_results: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Workflow Schemas
class WorkflowBase(BaseModel):
    name: str
    description: Optional[str] = None
    nodes: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]

class WorkflowCreate(WorkflowBase):
    pass

class WorkflowResponse(WorkflowBase):
    id: str
    is_active: bool
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardMetrics(BaseModel):
    total_claims: int
    processed_claims: int
    pending_claims: int
    avg_processing_time: float
    accuracy_rate: float
    auto_approval_rate: float
