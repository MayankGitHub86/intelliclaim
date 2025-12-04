#!/usr/bin/env python3
"""
Test the IntelliClaim AI Service directly
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.ai_service import EnhancedAIService
import json

def test_ai_service():
    """Test the IntelliClaim AI Service"""
    print("🧠 Testing IntelliClaim AI Service...")
    
    # Initialize AI service
    try:
        ai_service = EnhancedAIService()
        print(f"✅ AI Service initialized")
        print(f"   Gemini available: {ai_service.gemini_available}")
        print(f"   OpenAI available: {ai_service.openai_available}")
        print(f"   Overall available: {ai_service.is_available}")
        
        if not ai_service.is_available:
            print("❌ No AI services available")
            return False
            
    except Exception as e:
        print(f"❌ Failed to initialize AI service: {e}")
        return False
    
    # Test document analysis
    try:
        print("\n📄 Testing document analysis...")
        
        sample_document = """
        INSURANCE CLAIM REPORT
        Policy Number: POL-2024-VH-001234
        Incident Date: September 20, 2025
        Location: Downtown Parking Lot
        Description: Minor rear-end collision causing scratches and dents to rear bumper
        Estimated Repair Cost: ₹2,00,000
        Deductible: ₹40,000
        """
        
        result = ai_service.analyze_insurance_document(
            document_text=sample_document,
            user_query="Analyze this claim and provide recommendation"
        )
        
        print("✅ Document analysis successful!")
        print(f"   AI Service Used: {result.get('ai_service', 'Unknown')}")
        print(f"   Model Used: {result.get('model_used', 'Unknown')}")
        print(f"   Analysis Result: {json.dumps(result, indent=2)[:500]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Document analysis failed: {e}")
        return False

if __name__ == "__main__":
    test_ai_service()
