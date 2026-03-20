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
