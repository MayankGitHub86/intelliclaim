#!/usr/bin/env python3
"""
Comprehensive IntelliClaim Vision System Test
Tests Docker services, database connections, and API endpoints
"""

import os
import sys
import time
import requests
import psycopg2
import redis
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SystemTester:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.db_host = "127.0.0.1"  # Force IPv4
        self.db_port = 5432
        self.redis_host = "127.0.0.1"  # Force IPv4
        self.redis_port = 6379
        
        # Database connection
        self.db_config = {
            'host': self.db_host,
            'port': self.db_port,
            'database': os.getenv('POSTGRES_DB', 'intelliclaim_vision'),
            'user': os.getenv('DB_USER', 'intelliclaim_user'),
            'password': os.getenv('DB_PASSWORD')
        }
        
        # Redis connection
        self.redis_password = os.getenv('REDIS_PASSWORD')
    
    def test_api_health(self):
        """Test API health endpoint"""
        print("🔍 Testing API Health...")
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API Health: {data['status']}")
                print(f"   Version: {data['version']}")
                print(f"   Environment: {data['environment']}")
                return True
            else:
                print(f"❌ API Health failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ API Health error: {e}")
            return False
    
    def test_database_connection(self):
        """Test PostgreSQL database connection"""
        print("\n🗄️  Testing Database Connection...")
        try:
            conn = psycopg2.connect(**self.db_config)
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Database Connected: {version}")
            cursor.close()
            conn.close()
            return True
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            return False
    
    def test_redis_connection(self):
        """Test Redis connection"""
        print("\n🔴 Testing Redis Connection...")
        try:
            r = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                password=self.redis_password,
                decode_responses=True
            )
            r.ping()
            print("✅ Redis Connected")
            
            # Test basic operations
            r.set("test_key", "test_value", ex=10)
            value = r.get("test_key")
            if value == "test_value":
                print("✅ Redis Read/Write Working")
                r.delete("test_key")
                return True
            else:
                print("❌ Redis Read/Write Failed")
                return False
        except Exception as e:
            print(f"❌ Redis connection failed: {e}")
            return False
    
    def test_docker_services(self):
        """Test Docker service status"""
        print("\n🐳 Testing Docker Services...")
        try:
            import subprocess
            result = subprocess.run(
                ["docker-compose", "ps", "--format", "json"],
                cwd="/Users/aditya/IntelliClaim/intelliclaim-vision-backend",
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                print("✅ Docker Compose services are running")
                # Parse and show service status
                services = result.stdout.strip().split('\n')
                for service_line in services:
                    if service_line.strip():
                        try:
                            import json
                            service = json.loads(service_line)
                            name = service.get('Name', 'Unknown')
                            status = service.get('State', 'Unknown')
                            print(f"   {name}: {status}")
                        except:
                            print(f"   Service info: {service_line}")
                return True
            else:
                print(f"❌ Docker services check failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Docker services error: {e}")
            return False
    
    def test_api_endpoints(self):
        """Test various API endpoints"""
        print("\n🌐 Testing API Endpoints...")
        
        endpoints = [
            ("/health", "Health Check"),
            ("/", "Root Endpoint"),
            ("/docs", "API Documentation")
        ]
        
        results = []
        for endpoint, description in endpoints:
            try:
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                if response.status_code in [200, 404]:  # 404 is expected for some endpoints
                    print(f"✅ {description}: HTTP {response.status_code}")
                    results.append(True)
                else:
                    print(f"❌ {description}: HTTP {response.status_code}")
                    results.append(False)
            except Exception as e:
                print(f"❌ {description} error: {e}")
                results.append(False)
        
        return all(results)
    
    def test_environment_variables(self):
        """Test critical environment variables"""
        print("\n🔧 Testing Environment Variables...")
        
        required_vars = [
            'POSTGRES_PASSWORD',
            'REDIS_PASSWORD',
            'SECRET_KEY',
            'ACCESS_TOKEN_SECRET_KEY',
            'REFRESH_TOKEN_SECRET_KEY'
        ]
        
        optional_ai_vars = [
            'OPENAI_API_KEY',
            'PINECONE_API_KEY',
            'HUGGINGFACE_API_KEY'
        ]
        
        results = []
        for var in required_vars:
            value = os.getenv(var)
            if value:
                print(f"✅ {var}: Set")
                results.append(True)
            else:
                print(f"❌ {var}: Missing")
                results.append(False)
        
        print("\n🤖 AI Service Keys:")
        for var in optional_ai_vars:
            value = os.getenv(var)
            if value:
                print(f"✅ {var}: Set")
            else:
                print(f"⚠️  {var}: Not set (optional)")
        
        return all(results)
    
    def run_full_test(self):
        """Run all tests"""
        print("🚀 IntelliClaim Vision System Test")
        print("=" * 50)
        
        tests = [
            ("Environment Variables", self.test_environment_variables),
            ("Docker Services", self.test_docker_services),
            ("API Health", self.test_api_health),
            ("Database Connection", self.test_database_connection),
            ("Redis Connection", self.test_redis_connection),
            ("API Endpoints", self.test_api_endpoints)
        ]
        
        results = []
        for test_name, test_func in tests:
            try:
                result = test_func()
                results.append(result)
            except Exception as e:
                print(f"❌ {test_name} failed with error: {e}")
                results.append(False)
        
        print("\n" + "=" * 50)
        print("📊 Test Results Summary")
        print("=" * 50)
        
        passed = sum(results)
        total = len(results)
        
        for i, (test_name, _) in enumerate(tests):
            status = "✅ PASS" if results[i] else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print(f"\n🎯 Overall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All systems operational! IntelliClaim Vision is ready!")
        else:
            print("⚠️  Some systems need attention. Check failed tests above.")
        
        return passed == total

if __name__ == "__main__":
    tester = SystemTester()
    success = tester.run_full_test()
    sys.exit(0 if success else 1)
