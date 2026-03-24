import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from './api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  discountPercent: number;
  couponName: string | null;

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discountPercent: number, name: string) => void;
  removeCoupon: () => void;
  mergeReorder: (items: { productId: string; quantity: number; product?: Product }[]) => void;

  totalItems: () => number;
  subtotal: () => number;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountPercent: 0,
      couponName: null,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, discountPercent: 0, couponName: null }),

      setCoupon: (code, discountPercent, name) =>
        set({ couponCode: code, discountPercent, couponName: name }),

      removeCoupon: () => set({ couponCode: null, discountPercent: 0, couponName: null }),

      mergeReorder: (incoming) => {
        set((state) => {
          const newItems = [...state.items];
          for (const { productId, quantity, product } of incoming) {
            const idx = newItems.findIndex((i) => i.product.id === productId);
            if (idx >= 0) {
              newItems[idx] = { ...newItems[idx], quantity: newItems[idx].quantity + quantity };
            } else if (product) {
              newItems.push({ product, quantity });
            }
          }
          return { items: newItems };
        });
      },

      totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),

      subtotal: () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

      total: () => {
        const sub = get().subtotal();
        return sub - (sub * get().discountPercent) / 100;
      },
    }),
    { name: 'delivery-cart' },
  ),
);
