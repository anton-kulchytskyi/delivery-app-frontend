import { useState } from 'react';
import { api } from './api';
import { useCart } from './cart';
import { orderSchema, type OrderFormData, type OrderFormErrors } from './validations';

interface UseOrderSubmitResult {
  form: OrderFormData;
  errors: OrderFormErrors;
  submitting: boolean;
  success: boolean;
  setField: (field: keyof OrderFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  submit: (e: React.FormEvent) => Promise<void>;
}

export function useOrderSubmit(initialValues?: Partial<OrderFormData>): UseOrderSubmitResult {
  const { items, couponCode, clearCart } = useCart();
  const [form, setForm] = useState<OrderFormData>({
    name: initialValues?.name ?? '',
    phone: initialValues?.phone ?? '',
    address: initialValues?.address ?? '',
  });
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = (field: keyof OrderFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const result = orderSchema.safeParse(form);
    if (!result.success) {
      const errs: OrderFormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof OrderFormData;
        errs[field] = issue.message;
      });
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await api.createOrder({
        ...result.data,
        couponCode: couponCode ?? undefined,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });
      setSuccess(true);
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  return { form, errors, submitting, success, setField, submit };
}
