import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, X, Tag, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Img } from '@/components/Img';

// ─── Validation ───────────────────────────────────────────────────────────────

const orderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone must be at least 7 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

type OrderForm = z.infer<typeof orderSchema>;
type FormErrors = Partial<Record<keyof OrderForm, string>>;

// ─── CouponInput ──────────────────────────────────────────────────────────────

function CouponInput() {
  const { couponCode, couponName, discountPercent, setCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setValidating(true);
    try {
      const res = await api.validateCoupon(trimmed);
      setCoupon(trimmed, res.discountPercent, res.name);
      setCode('');
      toast.success(`Coupon applied: ${res.discountPercent}% off`);
    } catch (err) {
      toast.error((err as Error).message || 'Invalid coupon code');
    } finally {
      setValidating(false);
    }
  };

  if (couponCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-green-500" />
          <div>
            <p className="text-sm font-medium text-green-400">{couponName}</p>
            <p className="text-xs text-muted-foreground">{couponCode} · {discountPercent}% off</p>
          </div>
        </div>
        <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="pl-8 font-mono text-sm bg-secondary border-border"
        />
      </div>
      <button
        onClick={handleApply}
        disabled={!code.trim() || validating}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {validating ? '…' : 'Apply'}
      </button>
    </div>
  );
}

// ─── CartPage ─────────────────────────────────────────────────────────────────

export function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, subtotal, total, couponCode, clearCart } = useCart();
  const [form, setForm] = useState<OrderForm>({ name: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: keyof OrderForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }

    const result = orderSchema.safeParse(form);
    if (!result.success) {
      const errs: FormErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof OrderForm;
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
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error((err as Error).message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center animate-fade-up">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="font-display text-3xl font-light mb-3">Order placed!</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          We'll deliver your food as soon as possible.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Order more
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-5 py-2.5 border border-border text-muted-foreground rounded-lg text-sm hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            View history
          </button>
        </div>
      </div>
    );
  }

  const sub = subtotal();
  const tot = total();
  const discount = sub - tot;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up mb-8">
        <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">Checkout</p>
        <h1 className="font-display text-4xl sm:text-5xl font-light">Your <em>cart</em></h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 animate-fade-up">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-display text-xl text-muted-foreground mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Browse restaurants
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Items */}
          <div className="lg:col-span-3 space-y-3">
            {items.map((item, i) => (
              <div
                key={item.product.id}
                className={`flex gap-4 p-4 bg-card border border-border rounded-xl animate-fade-up stagger-${Math.min(i + 1, 4)}`}
              >
                <Img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-16 h-16 rounded-lg object-cover bg-secondary shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1 mb-0.5">{item.product.name}</p>
                  <p className="font-display text-primary">${item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <button onClick={() => removeItem(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center border border-border rounded-md hover:border-foreground/30 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-mono">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center border border-border rounded-md hover:border-foreground/30 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-5">
            {/* Order summary */}
            <div className="p-5 bg-card border border-border rounded-xl animate-fade-up stagger-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Summary</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${sub.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="font-display text-primary text-lg">${tot.toFixed(2)}</span>
                </div>
              </div>
              <CouponInput />
            </div>

            {/* Order form */}
            <form onSubmit={handleSubmit} className="p-5 bg-card border border-border rounded-xl space-y-4 animate-fade-up stagger-3">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Delivery details</p>

              {([
                { field: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe' },
                { field: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                { field: 'phone', label: 'Phone', type: 'tel', placeholder: '+380991234567' },
                { field: 'address', label: 'Address', type: 'text', placeholder: 'Kyiv, Khreshchatyk 1' },
              ] as const).map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <Label htmlFor={field} className="text-xs text-muted-foreground mb-1.5 block">
                    {label}
                  </Label>
                  <Input
                    id={field}
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={set(field)}
                    className={`bg-secondary border-border text-sm ${errors[field] ? 'border-destructive' : ''}`}
                  />
                  {errors[field] && (
                    <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {submitting ? 'Placing order…' : `Place order · $${tot.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
