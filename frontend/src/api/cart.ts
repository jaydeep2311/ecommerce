import api from './config';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: Array<{
      url: string;
      alt: string;
      isPrimary: boolean;
    }>;
    stock: number;
    isActive: boolean;
  };
  quantity: number;
  price: number;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  lastModified: string;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
  validationIssues?: Array<{
    productId: string;
    issue: string;
    action: string;
    maxQuantity?: number;
    oldPrice?: number;
    newPrice?: number;
  }>;
}

export const cartApi = {
  // Get user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (data: {
    productId: string;
    quantity: number;
  }): Promise<CartResponse> => {
    const response = await api.post('/cart/items', data);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (
    productId: string,
    data: { quantity: number }
  ): Promise<CartResponse> => {
    const response = await api.put(`/cart/items/${productId}`, data);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId: string): Promise<CartResponse> => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Validate cart items
  validateCart: async (): Promise<{
    success: boolean;
    data: {
      cart: Cart;
      validationResults: Array<{
        productId: string;
        issue: string;
        action: string;
        maxQuantity?: number;
        oldPrice?: number;
        newPrice?: number;
      }>;
      isValid: boolean;
    };
  }> => {
    const response = await api.get('/cart/validate');
    return response.data;
  },
};
