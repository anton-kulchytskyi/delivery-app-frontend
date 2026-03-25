const BASE_URL = import.meta.env.VITE_API_URL as string;

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') q.set(key, String(value));
  }
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

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
  email: string;
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

  shops: (params?: { rating_min?: number; rating_max?: number }) =>
    request<Shop[]>(`/shops${buildQuery({ rating_min: params?.rating_min, rating_max: params?.rating_max })}`),

  categories: () =>
    request<string[]>('/products/categories'),

  products: (params: {
    shopId?: string;
    category?: string;
    sort?: 'price_asc' | 'price_desc' | 'name_asc';
    cursor?: string;
    limit?: number;
  }) =>
    request<ProductsResponse>(`/products${buildQuery(params)}`),

  createOrder: (body: CreateOrderBody) =>
    request<Order>('/orders', { method: 'POST', body: JSON.stringify(body) }),

  searchOrders: (params: { id?: string; phone?: string }) =>
    request<Order[]>(`/orders${buildQuery(params)}`),

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
