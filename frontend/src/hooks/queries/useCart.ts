import { useQuery } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { useAuthStore } from '@/stores/authStore';

export const useCart = () => {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: !!token,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCartValidation = () => {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: ['cart', 'validation'],
    queryFn: cartApi.validateCart,
    enabled: !!token,
    staleTime: 30 * 1000, // 30 seconds
  });
};
