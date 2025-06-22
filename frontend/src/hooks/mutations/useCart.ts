import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { useCartActions } from '@/stores/cartStore';
import { toast } from 'react-hot-toast';

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { setCart } = useCartActions();

  return useMutation({
    mutationFn: cartApi.addToCart,
    onSuccess: (data) => {
      setCart(data.data);
      queryClient.setQueryData(['cart'], data);
      toast.success('Item added to cart!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toast.error(message);
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { setCart } = useCartActions();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateCartItem(productId, { quantity }),
    onSuccess: (data) => {
      setCart(data.data);
      queryClient.setQueryData(['cart'], data);
      toast.success('Cart updated!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update cart';
      toast.error(message);
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { setCart } = useCartActions();

  return useMutation({
    mutationFn: cartApi.removeFromCart,
    onSuccess: (data) => {
      setCart(data.data);
      queryClient.setQueryData(['cart'], data);
      toast.success('Item removed from cart!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove item';
      toast.error(message);
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { clearCart } = useCartActions();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: (data) => {
      clearCart();
      queryClient.setQueryData(['cart'], data);
      toast.success('Cart cleared!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to clear cart';
      toast.error(message);
    },
  });
};
