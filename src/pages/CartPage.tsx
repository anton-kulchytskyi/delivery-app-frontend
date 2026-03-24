import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useOrderSubmit } from '@/lib/useOrderSubmit';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Img } from '@/components/Img';
import { CouponInput } from '@/components/CouponInput';

// ─── CartPage ─────────────────────────────────────────────────────────────────

export function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = ((location.state ?? {}) as { name?: string; phone?: string; address?: string });

  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal);
  const total = useCart((s) => s.total);

  const { form, errors, submitting, success, setField, setFieldValue, submit } = useOrderSubmit(prefill);

  const handleSubmit = async (e: React.FormEvent) => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    try {
      await submit(e);
    } catch (err) {
      toast.error((err as Error).message || 'Failed to place order');
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

              <div>
                <Label htmlFor="name" className="text-xs text-muted-foreground mb-1.5 block">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  maxLength={100}
                  onChange={setField('name')}
                  className={`bg-secondary border-border text-sm ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name
                  ? <p className="text-xs mt-1 text-destructive">{errors.name}</p>
                  : <p className="text-xs mt-1 text-muted-foreground">Min 2, max 100 characters</p>
                }
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs text-muted-foreground mb-1.5 block">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const withoutPrefix = raw.startsWith('+38') ? raw.slice(3) : raw;
                    const digits = withoutPrefix.replace(/\D/g, '').slice(0, 10);
                    setFieldValue('phone', '+38' + digits);
                  }}
                  className={`bg-secondary border-border text-sm ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone
                  ? <p className="text-xs mt-1 text-destructive">{errors.phone}</p>
                  : <p className="text-xs mt-1 text-muted-foreground">+38 followed by 10 digits</p>
                }
              </div>

              <div>
                <Label htmlFor="address" className="text-xs text-muted-foreground mb-1.5 block">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Kyiv, Khreshchatyk 1"
                  value={form.address}
                  maxLength={200}
                  onChange={setField('address')}
                  className={`bg-secondary border-border text-sm ${errors.address ? 'border-destructive' : ''}`}
                />
                {errors.address
                  ? <p className="text-xs mt-1 text-destructive">{errors.address}</p>
                  : <p className="text-xs mt-1 text-muted-foreground">Min 5, max 200 characters</p>
                }
              </div>

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
