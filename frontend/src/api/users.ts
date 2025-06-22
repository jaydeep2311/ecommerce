import api from './config';

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
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface UsersResponse {
  success: boolean;
  count: number;
  total: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: User[];
}

export interface UserResponse {
  success: boolean;
  data: User;
  message?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive?: boolean;
}

export const usersApi = {
  // Get all users (Admin only)
  getUsers: async (query: UsersQuery = {}): Promise<UsersResponse> => {
    const response = await api.get('/users', { params: query });
    return response.data;
  },

  // Get single user (Admin only)
  getUser: async (id: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user (Admin only)
  createUser: async (data: CreateUserData): Promise<UserResponse> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (id: string, data: UpdateUserData): Promise<UserResponse> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Restore user (Admin only)
  restoreUser: async (id: string): Promise<UserResponse> => {
    const response = await api.put(`/users/${id}/restore`);
    return response.data;
  },

  // Toggle user status (Admin only)
  toggleUserStatus: async (id: string): Promise<UserResponse> => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },
};
