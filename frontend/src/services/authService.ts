import { AuthRequest, AuthResponse } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }

    return response.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }

    return response.json();
  },

  async validateToken(token: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    return response.json();
  },

  getToken(): string | null {
    return localStorage.getItem('lifeflow-token');
  },

  setToken(token: string): void {
    localStorage.setItem('lifeflow-token', token);
  },

  removeToken(): void {
    localStorage.removeItem('lifeflow-token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
