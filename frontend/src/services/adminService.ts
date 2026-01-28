import { User } from '../types';
import authService from './authService';

const API_BASE_URL = '/api/admin';

export const adminService = {
  async getAllUsers(): Promise<User[]> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  async promoteUserToAdmin(userId: number): Promise<any> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/promote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to promote user');
    }

    return response.json();
  },

  async demoteUserToUser(userId: number): Promise<any> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/demote`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to demote user');
    }

    return response.json();
  },

  async deleteUser(userId: number): Promise<any> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return response.json();
  },
};

export default adminService;
