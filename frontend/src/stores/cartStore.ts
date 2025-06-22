import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  _id?: string;
  user?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  lastModified: string;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  calculateTotals: () => void;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      isLoading: false,
      error: null,

      // Actions
      setCart: (cart: Cart) => {
        set({ cart, error: null });
      },

      addItem: (item: CartItem) => {
        const currentCart = get().cart;
        if (!currentCart) {
          const newCart: Cart = {
            items: [item],
            totalItems: item.quantity,
            totalAmount: item.price * item.quantity,
            lastModified: new Date().toISOString(),
          };
          set({ cart: newCart });
          return;
        }

        const existingItemIndex = currentCart.items.findIndex(
          (cartItem) => cartItem.product._id === item.product._id
        );

        let updatedItems: CartItem[];
        if (existingItemIndex > -1) {
          // Update existing item
          updatedItems = [...currentCart.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + item.quantity,
            price: item.price, // Update price in case it changed
          };
        } else {
          // Add new item
          updatedItems = [...currentCart.items, item];
        }

        const updatedCart = {
          ...currentCart,
          items: updatedItems,
          lastModified: new Date().toISOString(),
        };

        // Calculate totals
        updatedCart.totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
        updatedCart.totalAmount = updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        set({ cart: updatedCart });
      },

      updateItemQuantity: (productId: string, quantity: number) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        let updatedItems: CartItem[];
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          updatedItems = currentCart.items.filter(
            (item) => item.product._id !== productId
          );
        } else {
          // Update quantity
          updatedItems = currentCart.items.map((item) =>
            item.product._id === productId
              ? { ...item, quantity }
              : item
          );
        }

        const updatedCart = {
          ...currentCart,
          items: updatedItems,
          lastModified: new Date().toISOString(),
        };

        // Calculate totals
        updatedCart.totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
        updatedCart.totalAmount = updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        set({ cart: updatedCart });
      },

      removeItem: (productId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(
          (item) => item.product._id !== productId
        );

        const updatedCart = {
          ...currentCart,
          items: updatedItems,
          lastModified: new Date().toISOString(),
        };

        // Calculate totals
        updatedCart.totalItems = updatedItems.reduce((total, item) => total + item.quantity, 0);
        updatedCart.totalAmount = updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        set({ cart: updatedCart });
      },

      clearCart: () => {
        set({
          cart: {
            items: [],
            totalItems: 0,
            totalAmount: 0,
            lastModified: new Date().toISOString(),
          },
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      calculateTotals: () => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const totalItems = currentCart.items.reduce((total, item) => total + item.quantity, 0);
        const totalAmount = currentCart.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );

        set({
          cart: {
            ...currentCart,
            totalItems,
            totalAmount,
            lastModified: new Date().toISOString(),
          },
        });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

// Selectors
export const useCart = () => {
  const store = useCartStore();
  return {
    cart: store.cart,
    isLoading: store.isLoading,
    error: store.error,
    itemCount: store.cart?.totalItems || 0,
    totalAmount: store.cart?.totalAmount || 0,
    isEmpty: !store.cart || store.cart.items.length === 0,
  };
};

export const useCartActions = () => {
  const store = useCartStore();
  return {
    setCart: store.setCart,
    addItem: store.addItem,
    updateItemQuantity: store.updateItemQuantity,
    removeItem: store.removeItem,
    clearCart: store.clearCart,
    setLoading: store.setLoading,
    setError: store.setError,
    clearError: store.clearError,
    calculateTotals: store.calculateTotals,
  };
};
