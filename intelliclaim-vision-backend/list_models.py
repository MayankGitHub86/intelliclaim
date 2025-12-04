#!/usr/bin/env python3
"""
List available Gemini models
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def list_gemini_models():
    """List all available Gemini models"""
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=api_key)
        
        print("🔍 Available Gemini Models:")
        print("-" * 40)
        
        models = list(genai.list_models())
        for model in models:
            print(f"Model: {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Supported Methods: {', '.join(model.supported_generation_methods)}")
            print()
            
    except Exception as e:
        print(f"❌ Error listing models: {e}")

if __name__ == "__main__":
    list_gemini_models()
