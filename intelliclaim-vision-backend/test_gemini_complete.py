#!/usr/bin/env python3
"""
Test Gemini API connection and functionality
"""

import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_gemini_connection():
    """Test basic Gemini API connection"""
    print("🔍 Testing Gemini API Connection...")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ GEMINI_API_KEY not found in environment variables")
        return False
    
    print(f"✅ Found API key: {api_key[:10]}...{api_key[-4:]}")
    
    try:
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Test with a simple model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Simple test prompt
        response = model.generate_content("Hello! Can you respond with 'Gemini is working!'?")
        
        if response and response.text:
            print(f"✅ Gemini response: {response.text}")
            return True
        else:
            print("❌ No response from Gemini")
            return False
            
    except Exception as e:
        print(f"❌ Gemini connection failed: {str(e)}")
        return False

def test_gemini_json_response():
    """Test Gemini JSON response capability"""
    print("\n📋 Testing Gemini JSON Response...")
    
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Configure for JSON response
        generation_config = {
            "temperature": 0.1,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1000,
            "response_mime_type": "application/json"
        }
        
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=generation_config
        )
        
        prompt = """
        Analyze this sample insurance claim and respond in JSON format:
        
        "Policy: POL-123, Incident: Minor car damage, Amount: $2000"
        
        Respond with JSON containing:
        - claim_type: string
        - severity: string  
        - recommended_action: string
        - confidence: number (0-1)
        """
        
        response = model.generate_content(prompt)
        
        if response and response.text:
            try:
                # Try to parse as JSON
                json_result = json.loads(response.text)
                print("✅ JSON Response successful:")
                print(json.dumps(json_result, indent=2))
                return True
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON response: {response.text}")
                print(f"JSON Error: {e}")
                return False
        else:
            print("❌ No response from Gemini")
            return False
            
    except Exception as e:
        print(f"❌ Gemini JSON test failed: {str(e)}")
        return False

def test_gemini_vision():
    """Test Gemini vision capabilities with a sample image"""
    print("\n👁️ Testing Gemini Vision...")
    
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        
        # Check if we have any uploaded images to test with
        uploaded_docs_dir = "/Users/aditya/IntelliClaim/intelliclaim-vision-backend/uploaded_documents"
        
        # Look for image files
        image_files = []
        if os.path.exists(uploaded_docs_dir):
            for file in os.listdir(uploaded_docs_dir):
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_files.append(os.path.join(uploaded_docs_dir, file))
        
        if not image_files:
            print("⚠️ No test images found in uploaded_documents directory")
            return True  # Not a failure, just no images to test
        
        # Test with the first image found
        test_image = image_files[0]
        print(f"🖼️ Testing with image: {os.path.basename(test_image)}")
        
        # Upload file to Gemini
        uploaded_file = genai.upload_file(path=test_image)
        print(f"✅ Image uploaded to Gemini: {uploaded_file.name}")
        
        # Create vision model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Test vision analysis
        prompt = "Analyze this image and describe what you see. Is it related to insurance or vehicle damage?"
        
        response = model.generate_content([prompt, uploaded_file])
        
        if response and response.text:
            print(f"✅ Vision analysis successful:")
            print(f"Response: {response.text[:200]}...")
            return True
        else:
            print("❌ No vision response from Gemini")
            return False
            
    except Exception as e:
        print(f"❌ Gemini vision test failed: {str(e)}")
        return False

def main():
    """Run all Gemini tests"""
    print("🚀 IntelliClaim Gemini API Test Suite")
    print("=" * 50)
    
    results = []
    
    # Test 1: Basic connection
    results.append(test_gemini_connection())
    
    # Test 2: JSON response
    results.append(test_gemini_json_response())
    
    # Test 3: Vision capabilities
    results.append(test_gemini_vision())
    
    # Summary
    print(f"\n📊 Test Results Summary:")
    print(f"Tests passed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("🎉 All Gemini tests passed! Your API is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the errors above.")
        
    return all(results)

if __name__ == "__main__":
    main()
