import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:8000';

export function SimpleBackendTester() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url, method = 'GET', body = null) => {
    setLoading(true);
    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      let data;
      
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      setResults(prev => ({
        ...prev,
        [name]: {
          success: response.ok,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
  };

  const TestButton = ({ name, url, method = 'GET', body = null, children }) => (
    <button
      onClick={() => testEndpoint(name, url, method, body)}
      disabled={loading}
      style={{
        padding: '8px 16px',
        margin: '4px',
        backgroundColor: '#0066FF',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1
      }}
    >
      {children}
    </button>
  );

  const ResultDisplay = ({ name }) => {
    const result = results[name];
    if (!result) return null;

    return (
      <div style={{
        margin: '8px 0',
        padding: '12px',
        border: `1px solid ${result.success ? '#22C55E' : '#EF4444'}`,
        borderRadius: '4px',
        backgroundColor: result.success ? '#F0FDF4' : '#FEF2F2'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: result.success ? '#15803D' : '#DC2626',
          marginBottom: '8px'
        }}>
          {result.success ? '✅ SUCCESS' : '❌ FAILED'} - {result.timestamp}
        </div>
        
        {result.success ? (
          <pre style={{
            fontSize: '12px',
            backgroundColor: '#F3F4F6',
            padding: '8px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        ) : (
          <div style={{ color: '#DC2626' }}>
            Error: {result.error}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🧪 Backend API Tester
      </h1>

      <div style={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Core Backend Services</h2>
        
        <div style={{ marginBottom: '16px' }}>
          <h3>API Health & Status</h3>
          <TestButton name="health" url={`${API_BASE_URL}/health`}>
            Test Health Check
          </TestButton>
          <TestButton name="root" url={`${API_BASE_URL}/`}>
            Test Root Endpoint
          </TestButton>
          <ResultDisplay name="health" />
          <ResultDisplay name="root" />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3>API Documentation</h3>
          <TestButton name="docs" url={`${API_BASE_URL}/docs`}>
            Test API Docs
          </TestButton>
          <button
            onClick={() => window.open(`${API_BASE_URL}/docs`, '_blank')}
            style={{
              padding: '8px 16px',
              margin: '4px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📚 Open API Docs
          </button>
          <ResultDisplay name="docs" />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <h3>Future Endpoints (Will be implemented)</h3>
          <TestButton name="auth" url={`${API_BASE_URL}/api/v1/auth/test`}>
            Test Auth Endpoint
          </TestButton>
          <TestButton name="claims" url={`${API_BASE_URL}/api/v1/claims`}>
            Test Claims Endpoint
          </TestButton>
          <TestButton name="documents" url={`${API_BASE_URL}/api/v1/documents`}>
            Test Documents Endpoint
          </TestButton>
          <ResultDisplay name="auth" />
          <ResultDisplay name="claims" />
          <ResultDisplay name="documents" />
        </div>
      </div>

      <div style={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#F9FAFB'
      }}>
        <h2 style={{ marginBottom: '16px' }}>Backend Status Summary</h2>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>Backend URL:</strong> {API_BASE_URL}</p>
          <p><strong>Docker Services:</strong> API, PostgreSQL, Redis</p>
          <p><strong>AI Services:</strong> OpenAI, Pinecone, HuggingFace (configured)</p>
          <p><strong>Security:</strong> JWT tokens, bcrypt encryption</p>
        </div>
        
        <div style={{ marginTop: '16px' }}>
          <h3>Quick Links:</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a 
              href={`${API_BASE_URL}/health`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                backgroundColor: '#3B82F6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              💓 Health
            </a>
            <a 
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                backgroundColor: '#8B5CF6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              📚 API Docs
            </a>
            <a 
              href={`${API_BASE_URL}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                backgroundColor: '#10B981',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              🏠 API Root
            </a>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#3B82F6',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          🔄 Testing...
        </div>
      )}
    </div>
  );
}
