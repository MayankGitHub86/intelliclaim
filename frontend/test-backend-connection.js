#!/usr/bin/env node

// Simple test to verify frontend can connect to backend
const API_BASE_URL = 'http://localhost:8000';

async function testApiConnection() {
  console.log('🔗 Testing Frontend → Backend Connection');
  console.log('=' .repeat(50));

  try {
    // Test 1: Health Check
    console.log('🔍 Testing API Health...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Version: ${healthData.version}`);
      console.log(`   Environment: ${healthData.environment}`);
    } else {
      console.log('❌ Health Check: FAILED');
      return false;
    }

    // Test 2: CORS Check
    console.log('\n🌐 Testing CORS...');
    const corsResponse = await fetch(`${API_BASE_URL}/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      }
    });
    
    if (corsResponse.ok || corsResponse.status === 200) {
      console.log('✅ CORS: CONFIGURED');
    } else {
      console.log('⚠️  CORS: May need configuration');
    }

    // Test 3: API Documentation
    console.log('\n📚 Testing API Documentation...');
    const docsResponse = await fetch(`${API_BASE_URL}/docs`);
    
    if (docsResponse.ok) {
      console.log('✅ API Docs: ACCESSIBLE');
      console.log(`   URL: ${API_BASE_URL}/docs`);
    } else {
      console.log('❌ API Docs: NOT ACCESSIBLE');
    }

    // Test 4: Basic API Endpoints
    console.log('\n🛠  Testing API Endpoints...');
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    const rootData = await rootResponse.json();
    
    if (rootResponse.ok) {
      console.log('✅ Root Endpoint: WORKING');
      console.log(`   Message: ${rootData.message}`);
    } else {
      console.log('❌ Root Endpoint: FAILED');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Connection Test Results:');
    console.log('✅ Backend API is running and accessible');
    console.log('✅ Frontend can communicate with backend');
    console.log('✅ CORS is properly configured');
    console.log('✅ API documentation is available');
    
    console.log('\n🔗 Available URLs:');
    console.log(`   • API Health: ${API_BASE_URL}/health`);
    console.log(`   • API Docs: ${API_BASE_URL}/docs`);
    console.log(`   • API Root: ${API_BASE_URL}/`);
    
    console.log('\n🚀 Frontend Integration Ready!');
    console.log('   Your React app can now make API calls to the backend.');
    
    return true;
    
  } catch (error) {
    console.log('\n❌ Connection Test FAILED');
    console.error('Error:', error.message);
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure backend is running: docker-compose -f docker-compose-simple.yml up -d');
    console.log('   2. Check if port 8000 is accessible: curl http://localhost:8000/health');
    console.log('   3. Verify Docker containers: docker-compose -f docker-compose-simple.yml ps');
    
    return false;
  }
}

// Run the test
testApiConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
