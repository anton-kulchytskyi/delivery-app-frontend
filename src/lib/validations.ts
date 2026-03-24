import { z } from 'zod';

export const orderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().regex(/^\+38\d{10}$/, 'Enter 10 digits after +38'),
  address: z.string().min(5, 'Address must be at least 5 characters').max(200, 'Address is too long'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderFormErrors = Partial<Record<keyof OrderFormData, string>>;
