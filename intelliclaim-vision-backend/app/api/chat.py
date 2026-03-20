from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime

# Get gemini configuration from env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_PROMPT = """You are the IntelliClaim AI Assistant, an intelligent, empathetic, and professional conversational agent designed to help users with their insurance claims.
If a user indicates they've had an accident or want to file a claim, guide them through the process simply and concisely.
Ask for details step by step:
1. What happened?
2. When and where did it happen?
3. Were there any injuries?
4. Do you have photos of the damage?

Limit your responses to a few short sentences. Be helpful but do not overwhelm the user. Maintain a professional yet friendly tone.
You are chatting in a small widget, so format your text neatly using markdown but keep lists very brief.
"""

@router.post("/", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Configure safety and generation
        generation_config = {
            "temperature": 0.4,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        # Initialize model
        model = genai.GenerativeModel('gemini-2.5-flash', 
                                      system_instruction=SYSTEM_PROMPT,
                                      generation_config=generation_config)
        
        # Convert history to Gemini format
        gemini_history = []
        for msg in request.history:
            role = 'model' if msg.role == 'assistant' else 'user'
            gemini_history.append({'role': role, 'parts': [msg.content]})
            
        chat = model.start_chat(history=gemini_history)
        response = chat.send_message(request.message)
        
        return ChatResponse(
            response=response.text,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Chat API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")
