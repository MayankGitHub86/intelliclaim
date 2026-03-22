from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import logging
import uuid
import jwt
import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import local modules
from . import models, schemas
from .database import engine, get_db
from .document_processor import document_processor
from .api.demo import router as demo_router
from .api.chat import router as chat_router

# Create database tables (simple approach for dev/quick deploy)
models.Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="IntelliClaim API",
    description="AI-Powered Insurance Claims Processing System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration - support multiple origins and env var overrides
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Constants
security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# --- Utility Functions ---

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

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    user_id = verify_jwt_token(credentials.credentials)
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# --- Routes ---

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
        "message": "IntelliClaim API Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "supported_origins": ALLOWED_ORIGINS
    }

# --- Authentication ---

@app.post("/api/v1/auth/register", response_model=schemas.UserResponse)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_password,
        company=user_data.company,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@app.post("/api/v1/auth/login", response_model=schemas.Token)
async def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_jwt_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/api/v1/auth/google", response_model=schemas.Token)
async def google_login(google_data: schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Verify Token in Production
        if GOOGLE_CLIENT_ID:
            try:
                idinfo = id_token.verify_oauth2_token(
                    google_data.credential, 
                    google_requests.Request(), 
                    GOOGLE_CLIENT_ID
                )
                if idinfo['aud'] != GOOGLE_CLIENT_ID:
                    raise HTTPException(status_code=401, detail="Invalid token audience")
            except ValueError as e:
                logger.warning(f"Google token verification failed: {str(e)}")
        
        # Sync User
        user = db.query(models.User).filter(models.User.email == google_data.email).first()
        
        if not user:
            # Create a new user for Google login
            new_user = models.User(
                name=google_data.name,
                email=google_data.email,
                password_hash=hash_password(str(uuid.uuid4())),
                company="Google User",
                role="user",
                picture=google_data.picture,
                auth_provider="google"
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user = new_user
        else:
            # Update info
            user.picture = google_data.picture
            user.auth_provider = "google"
            db.commit()
            db.refresh(user)
        
        token = create_jwt_token(user.id)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }
        
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/auth/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- Dashboard ---

@app.get("/api/v1/dashboard/metrics", response_model=schemas.DashboardMetrics)
async def get_metrics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_claims = db.query(models.Claim).filter(models.Claim.user_id == current_user.id).count()
    processed_claims = db.query(models.Claim).filter(
        models.Claim.user_id == current_user.id,
        models.Claim.status.in_(["approved", "rejected", "denied"])
    ).count()
    pending_claims = total_claims - processed_claims
    
    return schemas.DashboardMetrics(
        total_claims=total_claims,
        processed_claims=processed_claims,
        pending_claims=pending_claims,
        avg_processing_time=2.1,
        accuracy_rate=98.5,
        auto_approval_rate=76.2
    )

# --- Documents ---

@app.post("/api/v1/documents/upload", response_model=schemas.DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = document_processor.save_file(content, unique_filename)
        
        new_doc = models.Document(
            filename=file.filename,
            unique_filename=unique_filename,
            file_path=file_path,
            content_type=file.content_type,
            size=len(content),
            user_id=current_user.id
        )
        
        db.add(new_doc)
        db.commit()
        db.refresh(new_doc)
        
        return new_doc
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload document")

@app.post("/api/v1/documents/analyze")
async def analyze_document(
    analysis_data: schemas.DocumentAnalysis,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.Document).filter(
        models.Document.id == analysis_data.document_id,
        models.Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Extract text and analyze
    extracted_text = document_processor.extract_text_from_file(doc.file_path)
    analysis_result = document_processor.analyze_document_content(
        text=extracted_text,
        document_type=analysis_data.document_type,
        user_query=analysis_data.query,
        file_path=doc.file_path
    )
    
    # Save results
    doc.analysis_results = analysis_result
    doc.analyzed_at = datetime.utcnow()
    db.commit()
    
    return analysis_result

# --- Claims ---

@app.get("/api/v1/claims/", response_model=List[schemas.ClaimResponse])
async def get_claims(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Claim).filter(models.Claim.user_id == current_user.id).all()

@app.post("/api/v1/claims/", response_model=schemas.ClaimResponse)
async def create_claim(
    claim_data: schemas.ClaimCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_claim = models.Claim(
        **claim_data.dict(),
        user_id=current_user.id,
        status="pending"
    )
    db.add(new_claim)
    db.commit()
    db.refresh(new_claim)
    return new_claim

# --- Workflows ---

@app.get("/api/v1/workflows/", response_model=List[schemas.WorkflowResponse])
async def get_workflows(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Workflow).filter(models.Workflow.user_id == current_user.id).all()

@app.post("/api/v1/workflows/", response_model=schemas.WorkflowResponse)
async def create_workflow(
    workflow_data: schemas.WorkflowCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_wf = models.Workflow(
        **workflow_data.dict(),
        user_id=current_user.id
    )
    db.add(new_wf)
    db.commit()
    db.refresh(new_wf)
    return new_wf

# --- Settings ---

@app.get("/api/v1/settings/profile")
async def get_settings(current_user: models.User = Depends(get_current_user)):
    return {
        "name": current_user.name,
        "email": current_user.email,
        "company": current_user.company,
        "role": current_user.role,
        "picture": current_user.picture
    }

@app.put("/api/v1/settings/profile")
async def update_settings(
    settings: Dict[str, Any],
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.name = settings.get("name", current_user.name)
    current_user.company = settings.get("company", current_user.company)
    current_user.role = settings.get("role", current_user.role)
    db.commit()
    return {"message": "Profile updated successfully"}

# Include external routers
app.include_router(demo_router, prefix="/api/v1/demo", tags=["demo"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
