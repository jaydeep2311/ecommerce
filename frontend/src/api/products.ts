import api from './config';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags: string[];
  features: string[];
  specifications?: Record<string, string>;
  rating: {
    average: number;
    count: number;
  };
  reviews: Array<{
    user: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  isActive: boolean;
  isFeatured: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  discountPercentage: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  primaryImage?: {
    url: string;
    alt: string;
  };
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  tags?: string[];
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  pagination?: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  data: Product;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku?: string;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  stock: number;
  lowStockThreshold?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  tags?: string[];
  features?: string[];
  specifications?: Record<string, string>;
  isFeatured?: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
}

export const productsApi = {
  // Get all products
  getProducts: async (query: ProductsQuery = {}): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  // Get single product
  getProduct: async (id: string): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create product (Admin only)
  createProduct: async (data: CreateProductData): Promise<ProductResponse> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Update product (Admin only)
  updateProduct: async (id: string, data: Partial<CreateProductData>): Promise<ProductResponse> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (Admin only)
  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/products/categories');
    return response.data;
  },

  // Get brands
  getBrands: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get('/products/brands');
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit: number = 8): Promise<ProductsResponse> => {
    const response = await api.get(`/products?featured=true&limit=${limit}`);
    return response.data;
  },

  // Get related products
  getRelatedProducts: async (
    category: string,
    excludeId: string,
    limit: number = 4
  ): Promise<ProductsResponse> => {
    const response = await api.get(
      `/products?category=${category}&limit=${limit}&exclude=${excludeId}`
    );
    return response.data;
  },

  // Add product review
  addReview: async (
    productId: string,
    data: { rating: number; comment?: string }
  ): Promise<ProductResponse> => {
    const response = await api.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  // Admin: Restore soft-deleted product
  restoreProduct: async (id: string): Promise<ProductResponse> => {
    const response = await api.put(`/products/${id}/restore`);
    return response.data;
  },

  // Admin: Get all soft-deleted products
  getDeletedProducts: async (query: ProductsQuery = {}): Promise<ProductsResponse> => {
    const response = await api.get('/products/deleted/all', { params: query });
    return response.data;
  },
};
