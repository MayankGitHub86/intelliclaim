#!/usr/bin/env python3
"""
AI Services Connection Test for IntelliClaim Vision
Tests OpenAI, Pinecone, and HuggingFace API connections
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_openai():
    """Test OpenAI API connection"""
    try:
        import openai
        api_key = os.getenv('OPENAI_API_KEY')
        
        if not api_key:
            return False, "❌ OpenAI API key not found in environment"
        
        if not api_key.startswith('sk-'):
            return False, "❌ Invalid OpenAI API key format"
        
        # Test with a simple completion
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5
        )
        
        return True, f"✅ OpenAI connection successful! Model: {response.model}"
    
    except ImportError:
        return False, "❌ OpenAI package not installed"
    except Exception as e:
        return False, f"❌ OpenAI connection failed: {str(e)[:100]}..."

def test_pinecone():
    """Test Pinecone API connection"""
    try:
        import pinecone
        api_key = os.getenv('PINECONE_API_KEY')
        
        if not api_key:
            return False, "❌ Pinecone API key not found in environment"
        
        if not api_key.startswith('pcsk_'):
            return False, "❌ Invalid Pinecone API key format"
        
        # Test connection with older pinecone-client package
        pinecone.init(api_key=api_key)
        indexes = pinecone.list_indexes()
        
        return True, f"✅ Pinecone connection successful! Available indexes: {len(indexes)}"
    
    except ImportError:
        return False, "❌ Pinecone package not installed"
    except Exception as e:
        return False, f"❌ Pinecone connection failed: {str(e)[:100]}..."

def test_huggingface():
    """Test HuggingFace API connection"""
    try:
        import requests
        api_key = os.getenv('HUGGINGFACE_API_KEY')
        
        if not api_key:
            return False, "❌ HuggingFace API key not found in environment"
        
        if not api_key.startswith('hf_'):
            return False, "❌ Invalid HuggingFace API key format"
        
        # Test with a simple API call
        headers = {"Authorization": f"Bearer {api_key}"}
        response = requests.get(
            "https://huggingface.co/api/whoami",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            user_info = response.json()
            return True, f"✅ HuggingFace connection successful! User: {user_info.get('name', 'Unknown')}"
        else:
            return False, f"❌ HuggingFace API returned status {response.status_code}"
    
    except ImportError:
        return False, "❌ Requests package not installed"
    except Exception as e:
        return False, f"❌ HuggingFace connection failed: {str(e)[:100]}..."

def main():
    """Run all API tests"""
    print("🧪 Testing AI Service Connections for IntelliClaim Vision\n")
    
    tests = [
        ("OpenAI", test_openai),
        ("Pinecone", test_pinecone),
        ("HuggingFace", test_huggingface)
    ]
    
    results = []
    
    for service_name, test_func in tests:
        print(f"Testing {service_name}...")
        success, message = test_func()
        results.append((service_name, success, message))
        print(f"  {message}")
        print()
    
    # Summary
    print("=" * 60)
    print("🎯 AI SERVICES TEST SUMMARY")
    print("=" * 60)
    
    successful = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    for service_name, success, message in results:
        status = "✅ READY" if success else "❌ NEEDS ATTENTION"
        print(f"{service_name:12} : {status}")
    
    print(f"\n📊 Overall Status: {successful}/{total} services ready")
    
    if successful == total:
        print("\n🎉 All AI services are ready! You can now:")
        print("   • Process documents with OpenAI")
        print("   • Store embeddings in Pinecone")
        print("   • Use HuggingFace models")
        print("   • Build your insurance processing features")
    else:
        print(f"\n⚠️  {total - successful} service(s) need attention before full functionality")
    
    print("\n🔗 Next Steps:")
    print("   • Restart Docker services: ./docker-manage.sh restart")
    print("   • Check API documentation: http://localhost:8000/docs")
    print("   • Start building AI features!")

if __name__ == "__main__":
    main()
