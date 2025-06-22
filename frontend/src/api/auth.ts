import api from './config';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: User;
}

export const authApi = {
  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Register user
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user details
  updateDetails: async (data: Partial<User>): Promise<{ success: boolean; data: User }> => {
    const response = await api.put('/auth/updatedetails', data);
    return response.data;
  },

  // Update password
  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthResponse> => {
    const response = await api.put('/auth/updatepassword', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.get('/auth/logout');
    return response.data;
  },
};
