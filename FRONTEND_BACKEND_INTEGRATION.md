# 🎯 IntelliClaim Frontend-Backend Integration Guide

## Overview
This guide shows you exactly how your existing frontend components integrate with the new backend APIs. Every feature in your frontend now has corresponding backend endpoints!

## 🔐 Authentication Integration

### Your Auth Component (`auth.tsx`) → Backend APIs

**Login Flow:**
```typescript
// In your Auth component, replace the mock login with:
import { apiClient, API_CONFIG } from '../config/api';

const handleLogin = async (email: string, password: string) => {
  try {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password
    });
    
    // Store the token
    apiClient.setToken(response.access_token);
    
    // Your user data is in response.user
    onAuthenticated(response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

**Registration Flow:**
```typescript
const handleRegister = async (userData) => {
  try {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
    // Auto-login after registration
    await handleLogin(userData.email, userData.password);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

## 📊 Dashboard Integration

### Your Dashboard Component (`dashboard.tsx`) → Real-time Data

**Replace Mock Metrics:**
```typescript
// In your Dashboard component
import { apiClient, API_CONFIG } from '../config/api';

const [metrics, setMetrics] = useState(null);
const [recentActivity, setRecentActivity] = useState([]);

useEffect(() => {
  const loadDashboardData = async () => {
    try {
      // Get real-time metrics
      const metricsData = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.METRICS);
      setMetrics(metricsData);
      
      // Get recent activity
      const statsData = await apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD.STATS);
      setRecentActivity(statsData.recent_activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  loadDashboardData();
  // Refresh every 30 seconds
  const interval = setInterval(loadDashboardData, 30000);
  return () => clearInterval(interval);
}, []);
```

**Real Metrics Display:**
```typescript
// Your existing metrics cards now show real data:
<div className="text-2xl font-bold">{metrics?.total_claims || 0}</div>
<div className="text-2xl font-bold">{metrics?.processed_claims || 0}</div>
<div className="text-2xl font-bold">{metrics?.accuracy_rate || 0}%</div>
```

## 📄 Document Processor Integration

### Your DocumentProcessor Component → AI Analysis

**File Upload:**
```typescript
// Replace your mock file upload
const handleFileUpload = async (file: File) => {
  try {
    setIsUploading(true);
    const response = await apiClient.uploadFile(
      API_CONFIG.ENDPOINTS.DOCUMENTS.UPLOAD,
      file
    );
    
    setDocumentId(response.document_id);
    console.log('File uploaded:', response.filename);
  } catch (error) {
    console.error('Upload failed:', error);
  } finally {
    setIsUploading(false);
  }
};
```

**AI Analysis (Your Natural Language Query):**
```typescript
// Replace your mock analysis in handleProcess
const handleProcess = async () => {
  if (!query.trim()) return;
  
  setIsProcessing(true);
  
  try {
    // Real AI analysis with your exact query format
    const analysis = await apiClient.post(API_CONFIG.ENDPOINTS.DOCUMENTS.ANALYZE, {
      query: query,
      context: "insurance claim analysis"
    });
    
    // Your existing result display works perfectly!
    setResult({
      decision: analysis.decision,
      amount: analysis.amount,
      confidence: analysis.confidence,
      justification: analysis.justification,
      coverageDetails: analysis.coverage_details
    });
    
  } catch (error) {
    console.error('Analysis failed:', error);
  } finally {
    setIsProcessing(false);
  }
};
```

## 👁️ Vision Inspector Integration

### Your VisionInspector Component → Computer Vision

**Image Analysis:**
```typescript
// Replace your mock analysis in handleAnalysis
const handleAnalysis = async () => {
  if (!selectedImage) return;
  
  setIsAnalyzing(true);
  
  try {
    // Convert your selectedImage to File object if needed
    const formData = new FormData();
    formData.append('file', selectedImage);
    
    const analysis = await apiClient.uploadFile(
      API_CONFIG.ENDPOINTS.VISION.ANALYZE,
      selectedImage
    );
    
    // Your existing detections display works!
    setDetections(analysis.detections.map(det => ({
      id: det.id,
      label: det.label,
      confidence: det.confidence,
      bbox: det.bbox,
      color: det.color
    })));
    
  } catch (error) {
    console.error('Vision analysis failed:', error);
  } finally {
    setIsAnalyzing(false);
  }
};
```

## 🔧 Workflow Builder Integration

### Your WorkflowBuilder Component → Workflow Management

**Save Workflow:**
```typescript
const handleSaveWorkflow = async () => {
  try {
    const workflowData = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes,
      connections: connections
    };
    
    const savedWorkflow = await apiClient.post(
      API_CONFIG.ENDPOINTS.WORKFLOWS.CREATE,
      workflowData
    );
    
    console.log('Workflow saved:', savedWorkflow.id);
  } catch (error) {
    console.error('Failed to save workflow:', error);
  }
};
```

**Load Workflows:**
```typescript
useEffect(() => {
  const loadWorkflows = async () => {
    try {
      const workflows = await apiClient.get(API_CONFIG.ENDPOINTS.WORKFLOWS.LIST);
      setAvailableWorkflows(workflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };
  
  loadWorkflows();
}, []);
```

## ⚙️ Settings Integration

### Your Settings Component → User Preferences

**Profile Settings:**
```typescript
const handleSaveProfile = async () => {
  try {
    await apiClient.put(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, {
      name: profileData.name,
      company: profileData.company,
      role: profileData.role
    });
    
    toast.success('Profile updated successfully!');
  } catch (error) {
    console.error('Failed to update profile:', error);
    toast.error('Failed to update profile');
  }
};
```

**Load User Settings:**
```typescript
useEffect(() => {
  const loadSettings = async () => {
    try {
      const profile = await apiClient.get(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE);
      setProfileData(profile);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };
  
  loadSettings();
}, []);
```

## 🔄 Real-time Features

### Add Live Updates to Your Components

**Dashboard Live Updates:**
```typescript
// Add to your Dashboard component
useEffect(() => {
  const eventSource = new EventSource('http://localhost:8000/api/v1/dashboard/stream');
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    setMetrics(data.metrics);
    setRecentActivity(data.recent_activity);
  };
  
  return () => eventSource.close();
}, []);
```

## 🚨 Error Handling

### Add Proper Error Handling to All Components

```typescript
const handleApiCall = async (apiFunction) => {
  try {
    setLoading(true);
    const result = await apiFunction();
    return result;
  } catch (error) {
    if (error.message === 'Authentication required') {
      // Redirect to login
      setIsAuthenticated(false);
    } else {
      toast.error(error.message || 'An error occurred');
    }
    throw error;
  } finally {
    setLoading(false);
  }
};
```

## 🎯 Complete Integration Example

Here's how to update your Auth component as a complete example:

```typescript
// In components/auth.tsx
import { apiClient, API_CONFIG, type LoginRequest, type RegisterRequest } from '../config/api';

export function Auth({ onAuthenticated }: AuthProps) {
  // ... existing state ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Real login
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });
        
        apiClient.setToken(response.access_token);
        toast.success("Welcome back to IntelliClaim!");
        onAuthenticated();
        
      } else {
        // Real registration
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match");
          return;
        }
        
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          company: formData.company || 'Default Company'
        });
        
        // Auto-login after registration
        const loginResponse = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
          email: formData.email,
          password: formData.password
        });
        
        apiClient.setToken(loginResponse.access_token);
        toast.success("Account created successfully!");
        onAuthenticated();
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component stays the same!
}
```

## 🚀 Testing Your Integration

1. **Start your backend:** The Docker containers are running with all APIs
2. **Start your frontend:** `npm run dev` in the frontend directory
3. **Test authentication:** Register a new user, then login
4. **Test document processing:** Upload a document and run AI analysis
5. **Test vision inspector:** Upload an image for computer vision analysis
6. **Test dashboard:** See real-time metrics and activity
7. **Test workflows:** Create and save custom workflows
8. **Test settings:** Update your profile and preferences

## 📝 Next Steps

1. **Replace mock data** in each component with API calls
2. **Add loading states** for better UX
3. **Implement error handling** throughout
4. **Add real-time updates** where appropriate
5. **Test all features** end-to-end

Your frontend components are perfectly designed and just need to connect to the real APIs! The data structures match exactly what your components expect.
