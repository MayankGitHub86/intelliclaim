#!/usr/bin/env python3
"""
Test script to verify Gemini vision capabilities directly
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv("/Users/aditya/IntelliClaim/intelliclaim-vision-backend/.env")

def test_gemini_vision():
    """Test Gemini's vision capabilities with a document file"""
    
    # Configure Gemini
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ No GEMINI_API_KEY found in environment")
        return False
    
    print(f"✅ Gemini API Key found: {api_key[:10]}...")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-pro")
        print("✅ Gemini client configured successfully")
        
        # Test file path
        file_path = "/Users/aditya/IntelliClaim/test_document.txt"
        
        if not os.path.exists(file_path):
            print(f"❌ Test file not found: {file_path}")
            return False
        
        print(f"✅ Test file found: {file_path}")
        
        # Upload file to Gemini
        print("🔄 Uploading file to Gemini...")
        uploaded_file = genai.upload_file(path=file_path)
        print(f"✅ File uploaded successfully: {uploaded_file.name}")
        
        # Create prompt
        prompt = """
        Analyze this document and provide a JSON response with the following structure:
        {
            "decision": "APPROVE or REJECT or NEEDS_REVIEW",
            "confidence": 85,
            "document_type": "detected document type",
            "summary": "Brief summary of document content"
        }
        """
        
        print("🔄 Generating analysis...")
        
        # Generate response
        response = model.generate_content([prompt, uploaded_file])
        
        print("✅ Analysis completed!")
        print("📋 Response:")
        print(response.text)
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Gemini Vision Capabilities")
    print("=" * 50)
    success = test_gemini_vision()
    print("=" * 50)
    if success:
        print("🎉 Gemini vision test completed successfully!")
    else:
        print("💥 Gemini vision test failed!")
