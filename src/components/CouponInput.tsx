import { useState } from 'react';
import { Tag, X, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function CouponInput() {
  const couponCode = useCart((s) => s.couponCode);
  const couponName = useCart((s) => s.couponName);
  const discountPercent = useCart((s) => s.discountPercent);
  const setCoupon = useCart((s) => s.setCoupon);
  const removeCoupon = useCart((s) => s.removeCoupon);
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
