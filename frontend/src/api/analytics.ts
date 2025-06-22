import api from './config';

export interface DashboardAnalytics {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
  ordersByStatus: Record<string, { count: number; revenue: number }>;
  topProducts: Array<{
    _id: string;
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  userTrends: Array<{
    _id: { year: number; month: number; day: number };
    count: number;
  }>;
  revenueTrends: Array<{
    _id: { year: number; month: number; day: number };
    revenue: number;
    orders: number;
  }>;
  stockAlerts: Array<{
    _id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
    category: string;
  }>;
  recentActivities: Array<{
    _id: string;
    orderNumber: string;
    user: { name: string; email: string };
    pricing: { total: number };
    status: string;
    createdAt: string;
  }>;
}

export interface UserAnalytics {
  userStats: Array<{
    _id: string;
    count: number;
    active: number;
    inactive: number;
  }>;
  registrationTrends: Array<{
    _id: { year: number; month: number };
    count: number;
  }>;
  topCustomers: Array<{
    _id: string;
    name: string;
    email: string;
    totalSpent: number;
    orderCount: number;
  }>;
}

export interface ProductAnalytics {
  productsByCategory: Array<{
    _id: string;
    count: number;
    averagePrice: number;
    totalStock: number;
  }>;
  stockStatus: Record<string, number>;
  topRatedProducts: Array<{
    _id: string;
    name: string;
    rating: { average: number; count: number };
    category: string;
    price: number;
  }>;
  productsNeedingAttention: Array<{
    _id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
    rating: { average: number; count: number };
    category: string;
  }>;
}

export interface SalesAnalytics {
  salesTrends: Array<{
    _id: { year: number; month?: number; day?: number; week?: number };
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>;
  paymentMethods: Array<{
    _id: string;
    count: number;
    revenue: number;
  }>;
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}

export const analyticsApi = {
  // Get dashboard analytics
  getDashboardAnalytics: async (query: AnalyticsQuery = {}): Promise<{
    success: boolean;
    data: DashboardAnalytics;
  }> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await api.get(`/analytics/dashboard?${params.toString()}`);
    return response.data;
  },

  // Get user analytics
  getUserAnalytics: async (query: AnalyticsQuery = {}): Promise<{
    success: boolean;
    data: UserAnalytics;
  }> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await api.get(`/analytics/users?${params.toString()}`);
    return response.data;
  },

  // Get product analytics
  getProductAnalytics: async (): Promise<{
    success: boolean;
    data: ProductAnalytics;
  }> => {
    const response = await api.get('/analytics/products');
    return response.data;
  },

  // Get sales analytics
  getSalesAnalytics: async (query: AnalyticsQuery = {}): Promise<{
    success: boolean;
    data: SalesAnalytics;
  }> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await api.get(`/analytics/sales?${params.toString()}`);
    return response.data;
  },
};
