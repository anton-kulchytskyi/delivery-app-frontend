import { describe, it, expect } from 'vitest';
import { orderSchema } from './validations';

describe('orderSchema', () => {
  const valid = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+380991234567',
    address: 'Kyiv, Khreshchatyk 1',
  };

  it('valid data passes', () => {
    expect(orderSchema.safeParse(valid).success).toBe(true);
  });

  it('invalid email fails', () => {
    const result = orderSchema.safeParse({ ...valid, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('phone wrong format fails', () => {
    const result = orderSchema.safeParse({ ...valid, phone: '0991234567' });
    expect(result.success).toBe(false);
  });

  it('name too short fails', () => {
    const result = orderSchema.safeParse({ ...valid, name: 'J' });
    expect(result.success).toBe(false);
  });

  it('address too short fails', () => {
    const result = orderSchema.safeParse({ ...valid, address: 'Kyiv' });
    expect(result.success).toBe(false);
  });
});
