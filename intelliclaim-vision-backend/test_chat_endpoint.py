import asyncio
from fastapi.testclient import TestClient
from app.main import app

def test_chat():
    client = TestClient(app)
    print("Testing /api/v1/chat endpoint...")
    response = client.post(
        "/api/v1/chat/",
        json={
            "message": "Hi, I got into a car accident today.",
            "history": []
        }
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Response: {data.get('response')}")
        print(f"Timestamp: {data.get('timestamp')}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_chat()
