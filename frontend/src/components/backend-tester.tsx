import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Server, 
  Database, 
  Zap, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Brain,
  Key,
  Cloud
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export function BackendTester() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTest, setActiveTest] = useState('');

  // Health Check Test
  const testHealth = async () => {
    setActiveTest('health');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        health: {
          success: response.ok,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        health: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
    setActiveTest('');
  };

  // Database Test (via API)
  const testDatabase = async () => {
    setActiveTest('database');
    setLoading(true);
    try {
      // This would test a database endpoint when implemented
      const response = await fetch(`${API_BASE_URL}/api/v1/test/database`);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        database: {
          success: response.ok,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        database: {
          success: false,
          error: 'Database test endpoint not implemented yet',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
    setActiveTest('');
  };

  // Redis Test (via API)
  const testRedis = async () => {
    setActiveTest('redis');
    setLoading(true);
    try {
      // This would test a redis endpoint when implemented
      const response = await fetch(`${API_BASE_URL}/api/v1/test/redis`);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        redis: {
          success: response.ok,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        redis: {
          success: false,
          error: 'Redis test endpoint not implemented yet',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
    setActiveTest('');
  };

  // AI Services Test
  const testAIServices = async () => {
    setActiveTest('ai');
    setLoading(true);
    try {
      // This would test AI service endpoints when implemented
      const response = await fetch(`${API_BASE_URL}/api/v1/test/ai-services`);
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        ai: {
          success: response.ok,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        ai: {
          success: false,
          error: 'AI services test endpoint not implemented yet',
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
    setActiveTest('');
  };

  // Custom API Test
  const [customEndpoint, setCustomEndpoint] = useState('/');
  const [customMethod, setCustomMethod] = useState('GET');
  const [customBody, setCustomBody] = useState('');

  const testCustomEndpoint = async () => {
    setActiveTest('custom');
    setLoading(true);
    try {
      const options = {
        method: customMethod,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (customBody && (customMethod === 'POST' || customMethod === 'PUT')) {
        options.body = customBody;
      }

      const response = await fetch(`${API_BASE_URL}${customEndpoint}`, options);
      let data;
      try {
        data = await response.json();
      } catch {
        data = await response.text();
      }

      setResults(prev => ({
        ...prev,
        custom: {
          success: response.ok,
          status: response.status,
          data: data,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        custom: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
    }
    setLoading(false);
    setActiveTest('');
  };

  const TestResult = ({ result, testName }) => {
    if (!result) return null;

    return (
      <Alert className={result.success ? "border-green-500" : "border-red-500"}>
        <div className="flex items-center space-x-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="font-medium">
            {result.success ? 'SUCCESS' : 'FAILED'}
          </span>
          <Badge variant="outline" className="text-xs">
            {result.timestamp}
          </Badge>
        </div>
        <AlertDescription className="mt-2">
          {result.success ? (
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">{result.error}</p>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Backend API Tester</span>
          </CardTitle>
          <CardDescription>
            Test your IntelliClaim Vision backend services from the frontend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Core Services</TabsTrigger>
              <TabsTrigger value="custom">Custom Tests</TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="space-y-4">
              {/* Quick Test All Button */}
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    testHealth();
                    setTimeout(testDatabase, 1000);
                    setTimeout(testRedis, 2000);
                    setTimeout(testAIServices, 3000);
                  }}
                  disabled={loading}
                  className="w-full"
                >
                  🚀 Test All Services
                </Button>
              </div>

              {/* Individual Service Tests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* API Health */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Server className="h-4 w-4" />
                      <span>API Health</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={testHealth}
                      disabled={loading && activeTest === 'health'}
                      className="w-full"
                      size="sm"
                    >
                      {loading && activeTest === 'health' ? 'Testing...' : 'Test Health'}
                    </Button>
                    <TestResult result={results.health} testName="health" />
                  </CardContent>
                </Card>

                {/* Database */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Database className="h-4 w-4" />
                      <span>Database</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={testDatabase}
                      disabled={loading && activeTest === 'database'}
                      className="w-full"
                      size="sm"
                    >
                      {loading && activeTest === 'database' ? 'Testing...' : 'Test Database'}
                    </Button>
                    <TestResult result={results.database} testName="database" />
                  </CardContent>
                </Card>

                {/* Redis */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Zap className="h-4 w-4" />
                      <span>Redis Cache</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={testRedis}
                      disabled={loading && activeTest === 'redis'}
                      className="w-full"
                      size="sm"
                    >
                      {loading && activeTest === 'redis' ? 'Testing...' : 'Test Redis'}
                    </Button>
                    <TestResult result={results.redis} testName="redis" />
                  </CardContent>
                </Card>

                {/* AI Services */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <Brain className="h-4 w-4" />
                      <span>AI Services</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={testAIServices}
                      disabled={loading && activeTest === 'ai'}
                      className="w-full"
                      size="sm"
                    >
                      {loading && activeTest === 'ai' ? 'Testing...' : 'Test AI Services'}
                    </Button>
                    <TestResult result={results.ai} testName="ai" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom API Test</CardTitle>
                  <CardDescription>
                    Test any endpoint on your backend API
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="method">Method</Label>
                      <select
                        id="method"
                        value={customMethod}
                        onChange={(e) => setCustomMethod(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="endpoint">Endpoint</Label>
                      <Input
                        id="endpoint"
                        value={customEndpoint}
                        onChange={(e) => setCustomEndpoint(e.target.value)}
                        placeholder="/api/v1/example"
                      />
                    </div>
                  </div>

                  {(customMethod === 'POST' || customMethod === 'PUT') && (
                    <div>
                      <Label htmlFor="body">Request Body (JSON)</Label>
                      <textarea
                        id="body"
                        value={customBody}
                        onChange={(e) => setCustomBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="w-full p-2 border rounded h-20"
                      />
                    </div>
                  )}

                  <Button
                    onClick={testCustomEndpoint}
                    disabled={loading && activeTest === 'custom'}
                    className="w-full"
                  >
                    {loading && activeTest === 'custom' ? 'Testing...' : `Test ${customMethod} ${customEndpoint}`}
                  </Button>

                  <TestResult result={results.custom} testName="custom" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Links */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                  className="w-full"
                >
                  📚 API Documentation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('http://localhost:8000/health', '_blank')}
                  className="w-full"
                >
                  💓 Health Check
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('http://localhost:8000/', '_blank')}
                  className="w-full"
                >
                  🏠 API Root
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
