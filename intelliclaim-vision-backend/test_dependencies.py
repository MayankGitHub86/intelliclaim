#!/usr/bin/env python3
"""
Test script to verify that all major dependencies are working correctly
"""

def test_imports():
    """Test that all major packages can be imported successfully"""
    
    print("Testing imports...")
    
    # FastAPI and Web Framework
    try:
        import fastapi
        import uvicorn
        import starlette
        print("✅ FastAPI and web framework packages imported successfully")
    except ImportError as e:
        print(f"❌ Error importing web framework packages: {e}")
        return False
    
    # Database
    try:
        import sqlalchemy
        import alembic
        import asyncpg
        print("✅ Database packages imported successfully")
    except ImportError as e:
        print(f"❌ Error importing database packages: {e}")
        return False
    
    # AI and Computer Vision
    try:
        import openai
        import cv2
        import numpy as np
        from PIL import Image
        print("✅ AI and computer vision packages imported successfully")
    except ImportError as e:
        print(f"❌ Error importing AI/CV packages: {e}")
        return False
    
    # Document Processing
    try:
        import PyPDF2
        from docx import Document
        import pytesseract
        print("✅ Document processing packages imported successfully")
    except ImportError as e:
        print(f"❌ Error importing document processing packages: {e}")
        return False
    
    # Background Tasks
    try:
        import celery
        import redis
        print("✅ Background task packages imported successfully")
    except ImportError as e:
        print(f"❌ Error importing background task packages: {e}")
        return False
    
    # Development Tools
    try:
        import pytest
        import black
        import isort
        print("✅ Development tools imported successfully")
    except ImportError as e:
        print(f"❌ Error importing development tools: {e}")
        return False
    
    print("\n🎉 All packages imported successfully!")
    return True

def test_basic_functionality():
    """Test basic functionality of key packages"""
    
    print("\nTesting basic functionality...")
    
    # Test FastAPI
    try:
        from fastapi import FastAPI
        app = FastAPI()
        
        @app.get("/")
        def read_root():
            return {"Hello": "World"}
        
        print("✅ FastAPI app created successfully")
    except Exception as e:
        print(f"❌ Error creating FastAPI app: {e}")
        return False
    
    # Test OpenCV
    try:
        import cv2
        import numpy as np
        
        # Create a simple test image
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        # Test basic OpenCV operations
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        print("✅ OpenCV basic operations working")
    except Exception as e:
        print(f"❌ Error with OpenCV operations: {e}")
        return False
    
    # Test SQLAlchemy
    try:
        from sqlalchemy import create_engine, MetaData
        # Test in-memory SQLite database
        engine = create_engine("sqlite:///:memory:")
        metadata = MetaData()
        print("✅ SQLAlchemy engine created successfully")
    except Exception as e:
        print(f"❌ Error creating SQLAlchemy engine: {e}")
        return False
    
    print("\n🎉 Basic functionality tests passed!")
    return True

if __name__ == "__main__":
    print("IntelliClaim Backend Dependencies Test")
    print("=" * 40)
    
    # Run tests
    imports_ok = test_imports()
    
    if imports_ok:
        functionality_ok = test_basic_functionality()
        
        if functionality_ok:
            print("\n✅ All tests passed! Your environment is ready for development.")
            exit(0)
        else:
            print("\n❌ Some functionality tests failed.")
            exit(1)
    else:
        print("\n❌ Import tests failed.")
        exit(1)
