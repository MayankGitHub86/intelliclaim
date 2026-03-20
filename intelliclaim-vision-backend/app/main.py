from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
import jwt
import bcrypt
import uuid
from datetime import datetime, timedelta
import os
from pathlib import Path
import logging
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# Load environment variables
load_dotenv()

# Import our document processor
from .document_processor import document_processor

# Import demo routes
from .api.demo import router as demo_router

# Import chat routes
from .api.chat import router as chat_router

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize FastAPI app
app = FastAPI(
    title="IntelliClaim API",
    description="AI-Powered Insurance Claims Processing System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")  # Add your Google Client ID to .env

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: Optional[str] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    credential: str
    email: str
    name: str
    picture: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str]
    role: str
    created_at: datetime

class ClaimCreate(BaseModel):
    title: str
    description: str
    amount: Optional[float] = None

class ClaimResponse(BaseModel):
    id: str
    title: str
    description: str
    status: str
    amount: Optional[float]
    confidence_score: Optional[float]
    ai_decision: Optional[str]
    created_at: datetime
    updated_at: datetime

class DocumentAnalysis(BaseModel):
    document_id: str
    query: str
    document_type: Optional[str] = "insurance_claim"
    context: Optional[str] = None

class DashboardMetrics(BaseModel):
    total_claims: int
    processed_claims: int
    pending_claims: int
    avg_processing_time: float
    accuracy_rate: float
    auto_approval_rate: float

class VisionAnalysis(BaseModel):
    image_id: str
    detections: List[Dict[str, Any]]
    confidence_scores: List[float]
    processing_time: float

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str]
    nodes: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]

# In-memory storage (replace with database in production)
users_db = {}
claims_db = {}
documents_db = {}
workflows_db = {}

# Utility functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = verify_jwt_token(credentials.credentials)
    if user_id not in users_db:
        raise HTTPException(status_code=401, detail="User not found")
    return users_db[user_id]

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "services": {
            "api": "running",
            "database": "connected",
            "ai_services": "ready"
        }
    }

@app.get("/")
async def root():
    return {
        "message": "IntelliClaim API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Authentication endpoints
@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if user already exists
    for user in users_db.values():
        if user["email"] == user_data.email:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    new_user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": hashed_password,
        "company": user_data.company,
        "role": user_data.role,
        "created_at": datetime.utcnow()
    }
    
    users_db[user_id] = new_user
    
    # Return user data (without password)
    return UserResponse(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        company=new_user["company"],
        role=new_user["role"],
        created_at=new_user["created_at"]
    )

@app.post("/api/v1/auth/login")
async def login(login_data: UserLogin):
    # Find user by email
    user = None
    for u in users_db.values():
        if u["email"] == login_data.email:
            user = u
            break
    
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create JWT token
    token = create_jwt_token(user["id"])
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "company": user["company"],
            "role": user["role"]
        }
    }

@app.post("/api/v1/auth/google")
async def google_login(google_data: GoogleLoginRequest):
    try:
        # Verify the Google token (optional but recommended for production)
        if GOOGLE_CLIENT_ID:
            try:
                idinfo = id_token.verify_oauth2_token(
                    google_data.credential, 
                    google_requests.Request(), 
                    GOOGLE_CLIENT_ID
                )
                
                # Verify the token is for our app
                if idinfo['aud'] != GOOGLE_CLIENT_ID:
                    raise HTTPException(status_code=401, detail="Invalid token audience")
                    
            except ValueError as e:
                logging.warning(f"Google token verification failed: {str(e)}")
                # Continue anyway for development, but log the warning
        
        # Check if user exists
        user = None
        for u in users_db.values():
            if u["email"] == google_data.email:
                user = u
                break
        
        # If user doesn't exist, create a new one
        if not user:
            user_id = str(uuid.uuid4())
            # Generate a random password for Google users (they won't use it)
            random_password = str(uuid.uuid4())
            hashed_password = hash_password(random_password)
            
            user = {
                "id": user_id,
                "name": google_data.name,
                "email": google_data.email,
                "password_hash": hashed_password,
                "company": "Google User",
                "role": "user",
                "google_id": google_data.email,  # Store Google identifier
                "picture": google_data.picture,
                "auth_provider": "google",
                "created_at": datetime.utcnow()
            }
            
            users_db[user_id] = user
            logging.info(f"New Google user created: {google_data.email}")
        else:
            # Update user's picture if provided
            if google_data.picture:
                user["picture"] = google_data.picture
            logging.info(f"Existing Google user logged in: {google_data.email}")
        
        # Create JWT token
        token = create_jwt_token(user["id"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "company": user.get("company"),
                "role": user["role"],
                "picture": user.get("picture")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Google authentication error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")

@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        company=current_user["company"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

# Dashboard endpoints
@app.get("/api/v1/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    # Calculate metrics from claims data
    total_claims = len(claims_db)
    processed_claims = sum(1 for claim in claims_db.values() if claim["status"] in ["approved", "rejected"])
    pending_claims = total_claims - processed_claims
    
    return DashboardMetrics(
        total_claims=total_claims,
        processed_claims=processed_claims,
        pending_claims=pending_claims,
        avg_processing_time=2.1,  # Mock data
        accuracy_rate=94.7,
        auto_approval_rate=78.3
    )

@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    return {
        "today": {
            "processed": 247,
            "avg_time": "2.1s",
            "accuracy": 94.7,
            "auto_approval": 78.3
        },
        "recent_activity": [
            {"id": "A001", "type": "Medical", "status": "approved", "time": "2m ago"},
            {"id": "A002", "type": "Auto", "status": "pending", "time": "5m ago"},
            {"id": "A003", "type": "Medical", "status": "approved", "time": "8m ago"},
            {"id": "A004", "type": "Property", "status": "review", "time": "12m ago"}
        ]
    }

# Document processing endpoints
@app.post("/api/v1/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    try:
        # Read file content
        file_content = await file.read()
        
        # Generate unique filename to avoid conflicts
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        
        # Save file using document processor
        file_path = document_processor.save_file(file_content, unique_filename)
        
        # Create document record
        document_id = str(uuid.uuid4())
        document = {
            "id": document_id,
            "filename": file.filename,
            "unique_filename": unique_filename,
            "file_path": file_path,
            "content_type": file.content_type,
            "size": len(file_content),
            "uploaded_by": current_user["id"],
            "created_at": datetime.utcnow(),
            "analysis_results": None
        }
        
        documents_db[document_id] = document
        
        logging.info(f"Document uploaded: {file.filename} -> {unique_filename} by user {current_user['email']}")
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "message": "Document uploaded and saved successfully",
            "size": len(file_content)
        }
        
    except Exception as e:
        logging.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@app.post("/api/v1/documents/analyze")
async def analyze_document(
    analysis_data: DocumentAnalysis,
    current_user: dict = Depends(get_current_user)
):
    try:
        # Find the document in our database
        document = documents_db.get(analysis_data.document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Check if user owns this document
        if document["uploaded_by"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied to this document")
        
        logging.info(f"Starting analysis for document: {document['filename']} (ID: {analysis_data.document_id})")
        
        # Extract text from the saved file
        file_path = document.get("file_path")
        if not file_path or not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Document file not found on disk")
        
        # Extract text content
        extracted_text = document_processor.extract_text_from_file(file_path)
        
        # Check if this is an image file
        is_image_file = document['content_type'].startswith('image/')
        
        if not extracted_text.strip() and not is_image_file:
            logging.warning(f"No text extracted from document: {document['filename']}")
            return {
                "decision": "UNDER_REVIEW",
                "amount": "₹0",
                "confidence": 50.0,
                "justification": "Unable to extract readable text from the document. Manual review required. Please ensure the document is clear and in a supported format.",
                "extracted_info": {
                    "text_length": 0,
                    "document_type": "unreadable",
                    "processing_error": "No text content found"
                },
                "analysis_timestamp": datetime.now().isoformat()
            }
        
        if extracted_text.strip():
            logging.info(f"Extracted {len(extracted_text)} characters from document")
        
        if is_image_file:
            logging.info(f"Image file detected: {document['filename']}, proceeding with Gemini Vision analysis")
        
        # Analyze the content with enhanced AI (including vision capabilities)
        analysis_result = document_processor.analyze_document_content(
            text=extracted_text or "", 
            document_type=analysis_data.document_type,
            user_query=analysis_data.query,
            file_path=file_path  # Pass file path for Gemini vision analysis
        )
        
        # Store analysis results in document record
        document["analysis_results"] = analysis_result
        document["analyzed_at"] = datetime.utcnow()
        
        logging.info(f"Analysis completed for document {document['filename']}: {analysis_result['decision']} with {analysis_result['confidence']}% confidence")
        
        # Add some additional context for the response
        analysis_result["document_info"] = {
            "filename": document["filename"],
            "content_type": document["content_type"],
            "size": document["size"],
            "text_extracted_length": len(extracted_text)
        }
        
        return analysis_result
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error analyzing document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze document: {str(e)}")

# Claims management endpoints
@app.get("/api/v1/claims/", response_model=List[ClaimResponse])
async def get_claims(current_user: dict = Depends(get_current_user)):
    user_claims = [claim for claim in claims_db.values() if claim["user_id"] == current_user["id"]]
    return [ClaimResponse(**claim) for claim in user_claims]

@app.post("/api/v1/claims/", response_model=ClaimResponse)
async def create_claim(claim_data: ClaimCreate, current_user: dict = Depends(get_current_user)):
    claim_id = str(uuid.uuid4())
    new_claim = {
        "id": claim_id,
        "user_id": current_user["id"],
        "title": claim_data.title,
        "description": claim_data.description,
        "status": "pending",
        "amount": claim_data.amount,
        "confidence_score": None,
        "ai_decision": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    claims_db[claim_id] = new_claim
    return ClaimResponse(**new_claim)

# Vision analysis endpoints
@app.post("/api/v1/vision/analyze")
async def analyze_vision(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Simulate computer vision analysis
    import time
    time.sleep(1.5)
    
    # Mock vision analysis results
    detections = [
        {
            "id": "det_1",
            "label": "Medical Document",
            "confidence": 96.8,
            "bbox": {"x": 145, "y": 203, "width": 180, "height": 120},
            "color": "#FF6B35"
        },
        {
            "id": "det_2", 
            "label": "Patient Signature",
            "confidence": 89.3,
            "bbox": {"x": 245, "y": 356, "width": 95, "height": 45},
            "color": "#00FF88"
        },
        {
            "id": "det_3",
            "label": "Date Stamp",
            "confidence": 92.1,
            "bbox": {"x": 67, "y": 89, "width": 85, "height": 30},
            "color": "#0066FF"
        }
    ]
    
    return {
        "analysis_id": str(uuid.uuid4()),
        "detections": detections,
        "processing_time": 1.5,
        "confidence_average": 92.7
    }

# Workflow endpoints
@app.get("/api/v1/workflows/")
async def get_workflows(current_user: dict = Depends(get_current_user)):
    user_workflows = [w for w in workflows_db.values() if w["user_id"] == current_user["id"]]
    return user_workflows

@app.post("/api/v1/workflows/")
async def create_workflow(workflow_data: WorkflowCreate, current_user: dict = Depends(get_current_user)):
    workflow_id = str(uuid.uuid4())
    new_workflow = {
        "id": workflow_id,
        "user_id": current_user["id"],
        "name": workflow_data.name,
        "description": workflow_data.description,
        "nodes": workflow_data.nodes,
        "connections": workflow_data.connections,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    workflows_db[workflow_id] = new_workflow
    return new_workflow

# Settings endpoints
@app.get("/api/v1/settings/profile")
async def get_profile_settings(current_user: dict = Depends(get_current_user)):
    return {
        "name": current_user["name"],
        "email": current_user["email"],
        "company": current_user["company"],
        "role": current_user["role"],
        "avatar": None
    }

@app.put("/api/v1/settings/profile")
async def update_profile_settings(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    # Update user profile
    user_id = current_user["id"]
    if user_id in users_db:
        users_db[user_id].update({
            "name": profile_data.get("name", current_user["name"]),
            "company": profile_data.get("company", current_user["company"]),
            "role": profile_data.get("role", current_user["role"])
        })
    
    return {"message": "Profile updated successfully"}

# Include demo routes for presentation
app.include_router(demo_router, prefix="/api/v1/demo", tags=["demo"])

# Include chat routes
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
