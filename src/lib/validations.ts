import { z } from 'zod';

const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

export const orderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Enter a valid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

export type OrderFormData = z.infer<typeof orderSchema>;
export type OrderFormErrors = Partial<Record<keyof OrderFormData, string>>;
