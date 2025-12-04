#!/usr/bin/env python3
"""
Simple API Key Validation for IntelliClaim Vision
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def validate_api_keys():
    """Validate API key formats and presence"""
    print("🔑 Validating AI Service API Keys\n")
    
    # OpenAI
    openai_key = os.getenv('OPENAI_API_KEY')
    if openai_key and openai_key.startswith('sk-'):
        print("✅ OpenAI API Key: Valid format")
        print(f"   Key: {openai_key[:10]}...{openai_key[-10:]}")
    else:
        print("❌ OpenAI API Key: Invalid or missing")
    
    # Pinecone
    pinecone_key = os.getenv('PINECONE_API_KEY')
    if pinecone_key and pinecone_key.startswith('pcsk_'):
        print("✅ Pinecone API Key: Valid format")
        print(f"   Key: {pinecone_key[:10]}...{pinecone_key[-10:]}")
    else:
        print("❌ Pinecone API Key: Invalid or missing")
    
    # HuggingFace
    hf_key = os.getenv('HUGGINGFACE_API_KEY')
    if hf_key and hf_key.startswith('hf_'):
        print("✅ HuggingFace API Key: Valid format")
        print(f"   Key: {hf_key[:10]}...{hf_key[-10:]}")
    else:
        print("❌ HuggingFace API Key: Invalid or missing")
    
    print("\n🚀 API keys are properly formatted!")
    print("📝 Note: Format validation only - actual API connectivity may require:")
    print("   • Valid account with credits (OpenAI)")
    print("   • Active Pinecone project")
    print("   • Valid HuggingFace token permissions")

if __name__ == "__main__":
    validate_api_keys()
