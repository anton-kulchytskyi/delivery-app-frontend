const BASE_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Shop {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  category: string;
}

export interface Product {
  id: string;
  shopId: string;
  name: string;
  imageUrl: string;
  price: number;
  category: string;
}

export interface ProductsResponse {
  data: Product[];
  nextCursor: string | null;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalPrice: number;
  couponCode: string | null;
  discount: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtOrder: number;
  product: Product;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  discountPercent: number;
  isActive: boolean;
}

export interface CouponValidation {
  valid: boolean;
  discountPercent: number;
  name: string;
}

export interface CreateOrderBody {
  name: string;
  email?: string;
  phone: string;
  address: string;
  couponCode?: string;
  items: { productId: string; quantity: number }[];
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  health: () =>
    request<{ status: string }>('/health'),

  shop: (id: string) =>
    request<Shop>(`/shops/${id}`),

  shops: (params?: { rating_min?: number; rating_max?: number }) => {
    const q = new URLSearchParams();
    if (params?.rating_min != null) q.set('rating_min', String(params.rating_min));
    if (params?.rating_max != null) q.set('rating_max', String(params.rating_max));
    const qs = q.toString();
    return request<Shop[]>(`/shops${qs ? `?${qs}` : ''}`);
  },

  products: (params: {
    shopId?: string;
    category?: string;
    sort?: 'price_asc' | 'price_desc' | 'name_asc';
    cursor?: string;
    limit?: number;
  }) => {
    const q = new URLSearchParams();
    if (params.shopId) q.set('shopId', params.shopId);
    if (params.category) q.set('category', params.category);
    if (params.sort) q.set('sort', params.sort);
    if (params.cursor) q.set('cursor', params.cursor);
    if (params.limit) q.set('limit', String(params.limit));
    return request<ProductsResponse>(`/products?${q.toString()}`);
  },

  createOrder: (body: CreateOrderBody) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),

  searchOrders: (params: { id?: string; phone?: string }) => {
    const q = new URLSearchParams();
    if (params.id) q.set('id', params.id);
    if (params.phone) q.set('phone', params.phone);
    return request<Order[]>(`/orders?${q.toString()}`);
  },

  reorder: (id: string) =>
    request<{ productId: string; quantity: number; priceAtOrder: number }[]>(
      `/orders/${id}/reorder`,
      { method: 'POST' },
    ),

  coupons: () =>
    request<Coupon[]>('/coupons'),

  validateCoupon: (code: string) =>
    request<CouponValidation>('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
};
