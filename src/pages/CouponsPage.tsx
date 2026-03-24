import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { api, type Coupon } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { Img } from '@/components/Img';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import { toast } from 'sonner';

function CouponCard({ coupon, index }: { coupon: Coupon; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    toast.success(`Code "${coupon.code}" copied!`, { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${Math.min(index % 4 + 1, 4)}`}
    >
      {/* Decorative left stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />

      <div className="pl-5 pr-5 pt-5 pb-4 flex gap-4 items-start">
        <Img
          src={coupon.imageUrl}
          alt={coupon.name}
          placeholderIcon="🏷"
          className="w-14 h-14 rounded-lg object-cover bg-secondary shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm mb-0.5 line-clamp-1">{coupon.name}</p>
          <p className="font-display text-2xl text-primary font-light">
            {coupon.discountPercent}% <span className="text-sm text-muted-foreground font-sans">off</span>
          </p>
        </div>
      </div>

      <div className="px-5 pb-4 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-secondary border border-dashed border-border/80 rounded-lg">
          <span className="font-mono text-sm tracking-widest text-foreground/80 flex-1">
            {coupon.code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
          }`}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function CouponCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden pl-5 pr-5 pt-5 pb-4">
      <div className="flex gap-4 items-start mb-4">
        <Skeleton className="w-14 h-14 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-7 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function CouponsPage() {
  const { data: coupons, loading, error, refetch } = useFetch(() => api.coupons(), []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up mb-8">
        <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">Save more</p>
        <h1 className="font-display text-4xl sm:text-5xl font-light">
          Discount <em>coupons</em>
        </h1>
        <p className="text-muted-foreground mt-3 text-sm max-w-md">
          Copy a code and paste it in the cart at checkout to apply your discount.
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={refetch} />}

      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <CouponCardSkeleton key={i} />)
            : (coupons ?? []).map((coupon, i) => <CouponCard key={coupon.id} coupon={coupon} index={i} />)
          }
        </div>
      )}

      {!loading && !error && (coupons ?? []).length === 0 && (
        <div className="text-center py-24 animate-fade-up">
          <p className="text-5xl mb-4">🏷</p>
          <p className="font-display text-xl text-muted-foreground">No coupons available</p>
        </div>
      )}
    </div>
  );
}
