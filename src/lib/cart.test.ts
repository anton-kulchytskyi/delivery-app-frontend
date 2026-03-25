import { describe, it, expect, beforeEach } from 'vitest';
import { useCart } from './cart';
import type { Product } from './api';

const makeProduct = (id: string, price: number): Product => ({
  id,
  shopId: 'shop-1',
  name: `Product ${id}`,
  imageUrl: '',
  price,
  category: 'Food',
});

const reset = () =>
  useCart.setState({ items: [], couponCode: null, discountPercent: 0, couponName: null });

describe('cart store', () => {
  beforeEach(reset);

  it('addItem: adds new product', () => {
    useCart.getState().addItem(makeProduct('a', 10));
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(1);
  });

  it('addItem: accumulates quantity for existing product', () => {
    const p = makeProduct('a', 10);
    useCart.getState().addItem(p);
    useCart.getState().addItem(p, 2);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it('removeItem: removes product', () => {
    useCart.getState().addItem(makeProduct('a', 10));
    useCart.getState().removeItem('a');
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('updateQuantity: updates quantity', () => {
    useCart.getState().addItem(makeProduct('a', 10));
    useCart.getState().updateQuantity('a', 5);
    expect(useCart.getState().items[0].quantity).toBe(5);
  });

  it('updateQuantity: removes item when quantity is 0', () => {
    useCart.getState().addItem(makeProduct('a', 10));
    useCart.getState().updateQuantity('a', 0);
    expect(useCart.getState().items).toHaveLength(0);
  });

  it('clearCart: clears items and coupon', () => {
    useCart.getState().addItem(makeProduct('a', 10));
    useCart.getState().setCoupon('SAVE10', 10, 'Save 10%');
    useCart.getState().clearCart();
    const s = useCart.getState();
    expect(s.items).toHaveLength(0);
    expect(s.couponCode).toBeNull();
    expect(s.discountPercent).toBe(0);
  });

  it('mergeReorder: accumulates quantity for existing item', () => {
    const p = makeProduct('a', 10);
    useCart.getState().addItem(p, 1);
    useCart.getState().mergeReorder([{ productId: 'a', quantity: 2, product: p }]);
    expect(useCart.getState().items[0].quantity).toBe(3);
  });

  it('mergeReorder: adds new item not in cart', () => {
    const p = makeProduct('b', 20);
    useCart.getState().mergeReorder([{ productId: 'b', quantity: 1, product: p }]);
    expect(useCart.getState().items).toHaveLength(1);
    expect(useCart.getState().items[0].product.id).toBe('b');
  });

  it('total: applies discount percent correctly', () => {
    useCart.getState().addItem(makeProduct('a', 100));
    useCart.getState().setCoupon('SAVE20', 20, 'Save 20%');
    expect(useCart.getState().total()).toBe(80);
  });

  it('total: equals subtotal when no coupon', () => {
    useCart.getState().addItem(makeProduct('a', 50), 2);
    expect(useCart.getState().total()).toBe(100);
    expect(useCart.getState().subtotal()).toBe(100);
  });
});
