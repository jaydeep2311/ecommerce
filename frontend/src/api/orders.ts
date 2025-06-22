import api from './config';

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name:string;
    email:string;
  };
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentInfo: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  pricing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  createdAt: string;
  updatedAt: string;
  canBeCancelled: boolean;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  total: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: Order[];
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

export const ordersApi = {
  // Create new order
  createOrder: async (data: CreateOrderData): Promise<OrderResponse> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async (query: OrdersQuery = {}): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get single order
  getOrder: async (id: string): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (
    id: string,
    data: { reason?: string }
  ): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/cancel`, data);
    return response.data;
  },

  // Admin: Get all orders
  getAllOrders: async (query: OrdersQuery = {}): Promise<OrdersResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/orders/admin/all?${params.toString()}`);
    return response.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (
    id: string,
    data: { status: string; note?: string }
  ): Promise<OrderResponse> => {
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },

  // Alias for getUserOrders (same as getMyOrders)
  getUserOrders: async (query: OrdersQuery = {}): Promise<OrdersResponse> => {
    return ordersApi.getMyOrders(query);
  },
};
