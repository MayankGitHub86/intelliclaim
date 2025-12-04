#!/usr/bin/env python3
"""
Test script to verify Gemini Flash 2.5 integration
"""

import os
import sys
from dotenv import load_dotenv

# Add the app directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from services.ai_service import EnhancedAIService

def test_gemini_flash():
    """Test Gemini Flash 2.5 functionality"""
    print("🧪 Testing Gemini Flash 2.5 Integration...")
    
    # Load environment variables
    load_dotenv()
    
    # Initialize AI service
    ai_service = EnhancedAIService()
    
    # Check if Gemini is available
    if not ai_service.gemini_available:
        print("❌ Gemini service not available!")
        print(f"   API Key present: {bool(ai_service.gemini_api_key)}")
        return False
    
    print(f"✅ Gemini Flash 2.5 initialized successfully!")
    print(f"   Model: {ai_service.gemini_model}")
    print(f"   Timeout: {ai_service.gemini_timeout_sec}s")
    print(f"   Max tokens: {ai_service.gemini_max_tokens}")
    
    # Test with a simple insurance document
    test_document = """
    INSURANCE CLAIM FORM
    
    Policy Number: INS-2025-001234
    Claim Date: 2025-09-27
    Incident Type: Vehicle Accident
    
    Description: Minor fender bender in parking lot. 
    Damage to rear bumper and taillight.
    
    Estimated Damage: $2,500
    Deductible: $500
    
    Supporting Documents: Photos, Police Report
    """
    
    try:
        print("\n🔄 Testing document analysis...")
        result = ai_service.analyze_insurance_document(
            document_text=test_document,
            user_query="Analyze this vehicle damage claim"
        )
        
        print("✅ Analysis completed successfully!")
        print(f"   Decision: {result.get('decision', 'N/A')}")
        print(f"   Confidence: {result.get('confidence', 'N/A')}%")
        print(f"   Model used: {result.get('model_used', 'N/A')}")
        print(f"   Service: {result.get('ai_service', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Analysis failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_gemini_flash()
    exit(0 if success else 1)
