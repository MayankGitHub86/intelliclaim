from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, WebSocket, WebSocketDisconnect
import os
print(f"LOADING APP FROM: {__file__}")
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
    token: str

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

class FeedbackCreate(BaseModel):
    document_id: str
    original_decision: str
    new_decision: str
    feedback_notes: str

class ChatMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []

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
async def google_login(login_data: GoogleLoginRequest):
    try:
        # Verify Google Token
        CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "193638521202-2fugpole2s8g3dqr66oks13rmimo1sot.apps.googleusercontent.com")
        # In a real app, you would verify the token with Google
        # For this demo, if the CLIENT_ID is the placeholder, we might simulate it 
        # but the library will fail if the token is not a real JWT from Google.
        idinfo = id_token.verify_oauth2_token(login_data.token, google_requests.Request(), CLIENT_ID)

        # ID token is valid. Get user's Google Account ID from the decoded token.
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        # Check if user exists, otherwise create
        user = None
        for u in users_db.values():
            if u["email"] == email:
                user = u
                break
        
        if not user:
            # Create new user for first-time Google login
            user_id = str(uuid.uuid4())
            user = {
                "id": user_id,
                "name": name,
                "email": email,
                "password_hash": "EXTERNAL_AUTH", 
                "company": "Google User",
                "role": "user",
                "created_at": datetime.utcnow()
            }
            users_db[user_id] = user
        
        # Create JWT token for our system
        token = create_jwt_token(user["id"])
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "company": user.get("company"),
                "role": user["role"]
            }
        }
    except ValueError as e:
        # Invalid token
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {str(e)}")
    except Exception as e:
        logging.error(f"Google login error: {str(e)}")
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

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logging.error(f"Error sending to websocket: {e}")
                # Connection might be dead, safe to ignore as it will be removed on disconnect
                pass

manager = ConnectionManager()

@app.websocket("/ws/dashboard")
async def websocket_dashboard(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for any client messages (ping)
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

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

import asyncio

@app.websocket("/api/v1/ws/analyze/{document_id}")
async def websocket_analyze(websocket: WebSocket, document_id: str):
    """Real-Time Analysis streaming via WebSockets"""
    await websocket.accept()
    
    document = documents_db.get(document_id)
    if not document:
        await websocket.send_json({"error": "Document not found"})
        await websocket.close()
        return
        
    file_path = document.get("file_path")
    if not file_path or not os.path.exists(file_path):
        await websocket.send_json({"error": "Document file not found on disk"})
        await websocket.close()
        return

    try:
        # Step 1: Extract Text
        await websocket.send_json({"progress": 15, "text": "Extracting text and meta-data...", "stage": "extract"})
        await asyncio.sleep(1) # mock visual delay for UX
        extracted_text = document_processor.extract_text_from_file(file_path)
        is_image_file = document['content_type'].startswith('image/')
        
        if not extracted_text.strip() and not is_image_file:
            await websocket.send_json({"error": "No readable text found. Manual review required."})
            await websocket.close()
            return
            
        await websocket.send_json({"progress": 40, "text": "Running Gemini Vision Model analysis...", "stage": "vision"})
        
        # Step 2: Run intense AI Model in background thread to keep WebSocket unblocked
        def run_ai():
            return document_processor.analyze_document_content(
                text=extracted_text or "",
                document_type="insurance_claim",
                user_query="Analyze this claim.",
                file_path=file_path
            )
            
        loop = asyncio.get_event_loop()
        task = loop.run_in_executor(None, run_ai)
        
        # Intermittent progress pushing
        await asyncio.sleep(1)
        if not task.done():
            await websocket.send_json({"progress": 65, "text": "Calculating Fraud Risk via active modeling...", "stage": "fraud"})
            
        await asyncio.sleep(1.5)
        if not task.done():
            await websocket.send_json({"progress": 85, "text": "Applying Policy Limitations and Coverage Checks...", "stage": "policy"})
            
        analysis_result = await task
        
        # Update db
        document["analysis_results"] = analysis_result
        document["analyzed_at"] = datetime.utcnow()
        analysis_result["document_info"] = {
            "filename": document["filename"],
            "content_type": document["content_type"],
            "size": document["size"],
            "text_extracted_length": len(extracted_text)
        }
        
        await websocket.send_json({"progress": 100, "text": "Analysis complete!", "stage": "done", "result": analysis_result})
        
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        await websocket.send_json({"error": str(e)})
        
    await websocket.close()

@app.post("/api/v1/documents/feedback")
async def submit_feedback(
    feedback: FeedbackCreate,
    current_user: dict = Depends(get_current_user)
):
    """Continuous Feedback Loop: Submit adjuster corrections to improve AI models"""
    # In a real app, this would append to a training dataset DB
    doc = documents_db.get(feedback.document_id)
    if not doc:
        logging.warning(f"Feedback submitted for unknown doc_id: {feedback.document_id}")
        
    logging.info(f"ACTIVE LEARNING: User {current_user['email']} reversed AI decision from {feedback.original_decision} to {feedback.new_decision}. Notes: {feedback.feedback_notes}")
    
    return {
        "status": "success",
        "message": "Feedback successfully logged for active learning fine-tuning.",
        "logged_data": feedback.dict()
    }

@app.post("/api/v1/chatbot")
async def chatbot_conversation(
    chat: ChatMessage,
    current_user: dict = Depends(get_current_user)
):
    """Conversational Claim Assistant Endpoint"""
    # Mocking Gemini response using simple logic for demonstration
    msg = chat.message.lower()
    
    if "hit" in msg or "rear" in msg or "accident" in msg:
        reply = "I'm sorry to hear about your accident. To fast-track your claim, could you please tell me the exact date and location of the incident? Also, do you have any photos handy?"
    elif "date" in msg or "yesterday" in msg or "today" in msg or "location" in msg:
        reply = "Got it. I have noted the date and location. Have you filed a police report (FIR), and are there any injuries I should be aware of?"
    elif "police" in msg or "fir" in msg or "yes" in msg:
        reply = "Thank you. I have successfully gathered the preliminary details for your comprehensive claim. You can now upload the photos or FIR document to the portal for immediate AI processing!"
    else:
        reply = "I understand. Could you provide a bit more detail about the incident, such as what specifically happened and if there's any property or vehicle damage?"
        
    return {
        "reply": reply,
        "action_required": "upload_docs" if "upload" in reply else "none"
    }

@app.get("/api/v1/fraud/network/{document_id}")
async def get_fraud_network_analysis(
    document_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Contextual Fraud Detection (Graph Network Analysis Mock)"""
    # In a real enterprise app, this applies Graph algorithms via Neo4j to find rings
    import random
    
    nodes = [
        {"id": "doc_1", "group": 1, "label": "Current Claim", "size": 25},
        {"id": "user_1", "group": 2, "label": current_user.get("name", "User"), "size": 15},
        {"id": "clinic_1", "group": 3, "label": "Fortis Hospital", "size": 15},
        {"id": "shop_1", "group": 4, "label": "Metro City Garage", "size": 15},
    ]
    edges = [
        {"from": "user_1", "to": "doc_1", "label": "filed"},
        {"from": "doc_1", "to": "clinic_1", "label": "treatment_at"},
        {"from": "doc_1", "to": "shop_1", "label": "repaired_at"},
    ]
    
    # 50% chance to simulate detecting an organized fraud ring for demo UX
    if random.random() > 0.5:
        suspicious_score = 8.5
        nodes.extend([
            {"id": "user_2", "group": 2, "label": "Prior Flagged User", "size": 10},
            {"id": "user_3", "group": 2, "label": "Associated Ring Member", "size": 10},
            {"id": "doc_2", "group": 1, "label": "Flagged Claim 884", "size": 10},
            {"id": "doc_3", "group": 1, "label": "Flagged Claim 992", "size": 10},
        ])
        edges.extend([
            {"from": "user_2", "to": "doc_2", "label": "filed"},
            {"from": "user_3", "to": "doc_3", "label": "filed"},
            {"from": "doc_2", "to": "clinic_1", "label": "treatment_at", "color": "red"},
            {"from": "doc_3", "to": "shop_1", "label": "repaired_at", "color": "red"},
        ])
    else:
        suspicious_score = 1.2
        
    return {
        "status": "success",
        "suspicious_score": suspicious_score,
        "network": {
            "nodes": nodes,
            "edges": edges
        },
        "insights": [
            "Analyzed 3rd degree connections via Graph Network algorithms.",
            "WARNING: Detected high-risk overlapping service providers from previously flagged fraudulent claims." if suspicious_score > 5 else "Clean: No historical fraudulent rings detected in 3rd degree connections."
        ]
    }

@app.post("/api/v1/documents/cross-check")
async def cross_check_documents(
    document_ids: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Perform cross-document consistency analysis"""
    from .services.cross_reference import cross_ref_engine
    
    analyses = []
    for doc_id in document_ids:
        doc = documents_db.get(doc_id)
        if doc and doc.get("analysis_results"):
            # Ensure doc_id is included for reference
            result = doc["analysis_results"]
            result["document_id"] = doc_id
            analyses.append(result)
            
    if not analyses:
        raise HTTPException(status_code=400, detail="No analyzed documents found for cross-checking")
        
    return cross_ref_engine.analyze_consistency(analyses)

# Forensics endpoints
class WeatherVerificationRequest(BaseModel):
    location: str
    incident_date: str
    claimed_condition: str

@app.post("/api/v1/forensics/weather")
async def verify_weather(
    request: WeatherVerificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Verify claim against historical weather data"""
    from .services.weather_forensics import weather_service
    return await weather_service.verify_weather_conditions(
        request.location,
        request.incident_date,
        request.claimed_condition
    )

@app.post("/api/v1/forensics/voice")
async def analyze_voice(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Analyze voice recording for fraud markers"""
    from .services.voice_forensics import voice_engine
    
    content = await file.read()
    return voice_engine.analyze_audio(content, file.filename)

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
    
    # Broadcast new claim event
    await manager.broadcast({
        "event": "NEW_CLAIM",
        "data": {
            "id": claim_id,
            "title": new_claim["title"],
            "amount": new_claim["amount"],
            "timestamp": datetime.utcnow().isoformat()
        }
    })
    
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

@app.get("/api/v1/settings/notifications")
async def get_notification_settings(current_user: dict = Depends(get_current_user)):
    return {
        "email_alerts": True,
        "browser_push": False,
        "daily_digest": True,
        "marketing": False
    }

@app.get("/api/v1/settings/ai")
async def get_ai_settings(current_user: dict = Depends(get_current_user)):
    return {
        "vision_confidence_threshold": 85.0,
        "auto_approval_limit": 5000.0,
        "enable_voice_analysis": True,
        "enable_weather_forensics": True
    }

# Include demo routes for presentation
app.include_router(demo_router, prefix="/api/v1/demo", tags=["demo"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
