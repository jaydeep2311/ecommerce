import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productsApi, ProductsQuery } from '@/api/products';

export const useProducts = (query: ProductsQuery = {}) => {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => productsApi.getProducts(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useInfiniteProducts = (query: ProductsQuery = {}) => {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', query],
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getProducts({ ...query, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination?.next) {
        return lastPage.pagination.next.page;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: productsApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['products', 'brands'],
    queryFn: productsApi.getBrands,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => productsApi.getProducts({ featured: true, limit }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRelatedProducts = (category: string, excludeId: string, limit: number = 4) => {
  return useQuery({
    queryKey: ['products', 'related', category, excludeId, limit],
    queryFn: () => productsApi.getProducts({ category, limit }),
    enabled: !!category,
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      ...data,
      data: data.data.filter(product => product._id !== excludeId),
    }),
  });
};

export const useDeletedProducts = (query: ProductsQuery = {}) => {
  return useQuery({
    queryKey: ['admin', 'deleted-products', query],
    queryFn: () => productsApi.getDeletedProducts(query),
    staleTime: 1 * 60 * 1000, // 1 minute (shorter cache for admin data)
  });
};
