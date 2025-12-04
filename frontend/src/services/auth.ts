// Authentication Service for IntelliClaim Frontend
import { apiClient, API_CONFIG, type LoginRequest, type RegisterRequest, type AuthResponse } from '../config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company?: string;
  role?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const userData = localStorage.getItem('current_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  }

  private saveUserToStorage(user: User): void {
    try {
      localStorage.setItem('current_user', JSON.stringify(user));
      this.currentUser = user;
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  private clearUserFromStorage(): void {
    localStorage.removeItem('current_user');
    this.currentUser = null;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email: credentials.email,
        password: credentials.password
      });

      // Store the authentication token
      apiClient.setToken(response.access_token);
      
      // Save user data
      this.saveUserToStorage(response.user);

      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Register the user
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        company: userData.company,
        role: userData.role || 'user'
      });
      
      // Auto-login after successful registration
      return await this.login({
        email: userData.email,
        password: userData.password
      });
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      apiClient.clearToken();
      this.clearUserFromStorage();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if server call fails
      apiClient.clearToken();
      this.clearUserFromStorage();
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      if (!this.currentUser) {
        const userData = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
        this.saveUserToStorage(userData);
        return userData;
      }
      return this.currentUser;
    } catch (error) {
      this.clearUserFromStorage();
      apiClient.clearToken();
      throw new Error('Authentication required');
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!localStorage.getItem('auth_token');
  }

  getUserData(): User | null {
    return this.currentUser;
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiClient.put(API_CONFIG.ENDPOINTS.SETTINGS.PROFILE, profileData);
      this.saveUserToStorage(updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }
}

// Create and export the singleton instance
export const authService = AuthService.getInstance();

// Authenticated API Client wrapper with automatic retry
export class AuthenticatedApiClient {
  async request(method: string, endpoint: string, data?: any): Promise<any> {
    try {
      let response;
      
      switch (method.toUpperCase()) {
        case 'GET':
          response = await apiClient.get(endpoint);
          break;
        case 'POST':
          response = await apiClient.post(endpoint, data);
          break;
        case 'PUT':
          response = await apiClient.put(endpoint, data);
          break;
        case 'DELETE':
          response = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return response;
    } catch (error) {
      if (error.message === 'Authentication required') {
        await authService.logout();
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  }

  async get(endpoint: string): Promise<any> {
    return this.request('GET', endpoint);
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.request('PUT', endpoint, data);
  }

  async delete(endpoint: string): Promise<any> {
    return this.request('DELETE', endpoint);
  }

  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<any> {
    try {
      return await apiClient.uploadFile(endpoint, file, additionalData);
    } catch (error) {
      if (error.message === 'Authentication required') {
        await authService.logout();
        throw new Error('Session expired. Please login again.');
      }
      throw error;
    }
  }
}

// Create authenticated API client instance
export const authenticatedApiClient = new AuthenticatedApiClient();

export default authService;
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    
    const authData = await response.json();
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authData.access_token);
    localStorage.setItem('refresh_token', authData.refresh_token);
    
    return authData;
  }

  // Refresh token
  static async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, {
      refresh_token: refreshToken
    });
    
    if (!response.ok) {
      // Clear tokens if refresh fails
      this.logout();
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    
    return data.access_token;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      // Try to logout on server
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {}, {
          'Authorization': `Bearer ${token}`
        });
      }
    } catch (error) {
      // Ignore logout errors, just clear local storage
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Get stored access token
  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Get authorization headers
  static getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}

// Enhanced API client with authentication
export class AuthenticatedApiClient {
  private async makeAuthenticatedRequest(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<Response> {
    const headers = {
      ...API_CONFIG.HEADERS,
      ...AuthService.getAuthHeaders(),
      ...customHeaders,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    let response = await apiClient.request(endpoint, options);

    // Handle token refresh on 401
    if (response.status === 401 && AuthService.isAuthenticated()) {
      try {
        await AuthService.refreshToken();
        
        // Retry request with new token
        const newHeaders = {
          ...headers,
          ...AuthService.getAuthHeaders(),
        };
        
        response = await apiClient.request(endpoint, {
          ...options,
          headers: newHeaders,
        });
      } catch (refreshError) {
        // Refresh failed, redirect to login
        AuthService.logout();
        throw new Error('Authentication expired. Please login again.');
      }
    }

    return response;
  }

  async get(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    return this.makeAuthenticatedRequest('GET', endpoint, undefined, headers);
  }

  async post(endpoint: string, data?: any, headers?: Record<string, string>): Promise<Response> {
    return this.makeAuthenticatedRequest('POST', endpoint, data, headers);
  }

  async put(endpoint: string, data?: any, headers?: Record<string, string>): Promise<Response> {
    return this.makeAuthenticatedRequest('PUT', endpoint, data, headers);
  }

  async delete(endpoint: string, headers?: Record<string, string>): Promise<Response> {
    return this.makeAuthenticatedRequest('DELETE', endpoint, undefined, headers);
  }
}

// Default authenticated API client instance
export const authApiClient = new AuthenticatedApiClient();
