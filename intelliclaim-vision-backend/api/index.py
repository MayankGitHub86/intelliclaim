"""
Vercel Serverless Function Entry Point
This file is required for Vercel to properly route requests to FastAPI
"""
from app.main import app

# Vercel expects a handler function
handler = app
