// API Configuration for IntelliClaim Frontend
// In development, this points to localhost via Vite proxy or direct call
// In production, we use the relative path /api which is proxied via vercel.json
const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

// API Endpoints Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Authentication
    AUTH: {
      REGISTER: '/api/v1/auth/register',
      LOGIN: '/api/v1/auth/login',
      GOOGLE_LOGIN: '/api/v1/auth/google',
      LOGOUT: '/api/v1/auth/logout',
      ME: '/api/v1/auth/me',
      REFRESH: '/api/v1/auth/refresh'
    },
    
    // Dashboard
    DASHBOARD: {
      METRICS: '/api/v1/dashboard/metrics',
      STATS: '/api/v1/dashboard/stats',
      RECENT: '/api/v1/dashboard/recent',
      CHARTS: '/api/v1/dashboard/charts'
    },
    
    // Document Processing
    DOCUMENTS: {
      UPLOAD: '/api/v1/documents/upload',
      ANALYZE: '/api/v1/documents/analyze',
      LIST: '/api/v1/documents/',
      GET: (id: string) => `/api/v1/documents/${id}`,
      UPDATE: (id: string) => `/api/v1/documents/${id}`,
      DELETE: (id: string) => `/api/v1/documents/${id}`,
      QUERY: '/api/v1/documents/query'
    },
    
    // Claims Management
    CLAIMS: {
      LIST: '/api/v1/claims/',
      CREATE: '/api/v1/claims/',
      GET: (id: string) => `/api/v1/claims/${id}`,
      UPDATE: (id: string) => `/api/v1/claims/${id}`,
      DELETE: (id: string) => `/api/v1/claims/${id}`,
      APPROVE: (id: string) => `/api/v1/claims/${id}/approve`,
      REJECT: (id: string) => `/api/v1/claims/${id}/reject`,
      HISTORY: (id: string) => `/api/v1/claims/${id}/history`
    },
    
    // Vision Inspector
    VISION: {
      ANALYZE: '/api/v1/vision/analyze',
      UPLOAD: '/api/v1/vision/upload',
      DETECTIONS: (id: string) => `/api/v1/vision/detections/${id}`,
      OCR: '/api/v1/vision/ocr',
      CLASSIFY: '/api/v1/vision/classify'
    },
    
    // Workflow Builder
    WORKFLOWS: {
      LIST: '/api/v1/workflows/',
      CREATE: '/api/v1/workflows/',
      GET: (id: string) => `/api/v1/workflows/${id}`,
      UPDATE: (id: string) => `/api/v1/workflows/${id}`,
      DELETE: (id: string) => `/api/v1/workflows/${id}`,
      EXECUTE: (id: string) => `/api/v1/workflows/${id}/execute`,
      TEMPLATES: '/api/v1/workflows/templates'
    },
    
    // Settings
    SETTINGS: {
      PROFILE: '/api/v1/settings/profile',
      NOTIFICATIONS: '/api/v1/settings/notifications',
      AI: '/api/v1/settings/ai',
      API: '/api/v1/settings/api'
    },
    
    // System
    SYSTEM: {
      HEALTH: '/health',
      STATUS: '/api/v1/system/status',
      LOGS: '/api/v1/system/logs',
      METRICS: '/api/v1/system/metrics'
    }
  }
};

// HTTP Client with Authentication
export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    this.token = localStorage.getItem('auth_token');
  }

  public setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        // Optionally redirect to login
        throw new Error('Authentication required');
      }
      
      let errorMessage = 'Request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  public async get(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  public async post(endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse(response);
  }

  public async put(endpoint: string, data?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse(response);
  }

  public async delete(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  public async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
    }

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Health check function
export async function checkApiHealth(): Promise<{ healthy: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      return { healthy: true, message: data.status };
    } else {
      return { healthy: false, message: `Server error: ${response.status}` };
    }
  } catch (error) {
    return { 
      healthy: false, 
      message: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
}

// Export types for TypeScript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  company?: string;
  role?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
    company?: string;
    role: string;
  };
}

export interface DashboardMetrics {
  total_claims: number;
  processed_claims: number;
  pending_claims: number;
  avg_processing_time: number;
  accuracy_rate: number;
  auto_approval_rate: number;
}

export interface DocumentAnalysisRequest {
  query: string;
  context?: string;
}

export interface ClaimResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  amount?: number;
  confidence_score?: number;
  ai_decision?: string;
  created_at: string;
  updated_at: string;
}
