import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, SlidersHorizontal } from 'lucide-react';
import { api, type Shop } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { Skeleton } from '@/components/ui/skeleton';
import { Img } from '@/components/Img';
import { ErrorState } from '@/components/ErrorState';

function RatingDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < Math.round(value) ? 'bg-primary' : 'bg-border'
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground font-mono">{value.toFixed(1)}</span>
    </div>
  );
}

function ShopCard({ shop, index }: { shop: Shop; index: number }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/shops/${shop.id}`, { state: { shop } })}
      className={`group text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)] transition-all duration-300 animate-fade-up stagger-${Math.min(index % 4 + 1, 4)}`}
    >
      <div className="aspect-4/3 overflow-hidden bg-secondary relative">
        <Img
          src={shop.imageUrl}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-3 left-3 text-xs font-medium bg-black/60 text-white backdrop-blur-sm px-2 py-1 rounded-md">
          {shop.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-medium mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {shop.name}
        </h3>
        <RatingDots value={shop.rating} />
      </div>
    </button>
  );
}

function ShopCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-4/3 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ShopsPage() {
  const [ratingMin, setRatingMin] = useState('');
  const [ratingMax, setRatingMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: shops, loading, error, refetch } = useFetch(
    () => api.shops({
      rating_min: ratingMin ? parseFloat(ratingMin) : undefined,
      rating_max: ratingMax ? parseFloat(ratingMax) : undefined,
    }),
    [ratingMin, ratingMax],
  );

  const resetFilters = () => { setRatingMin(''); setRatingMax(''); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">
            Order now
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-light">
            Choose a <em>restaurant</em>
          </h1>
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
            filtersOpen || ratingMin || ratingMax
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {(ratingMin || ratingMax) && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="mb-8 p-5 bg-card border border-border rounded-xl animate-fade-up">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Filter by rating
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-primary" />
              <span className="text-sm text-muted-foreground">Min</span>
              <div className="flex gap-1.5">
                {['3', '3.5', '4', '4.5'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setRatingMin(ratingMin === v ? '' : v)}
                    className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                      ratingMin === v
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Max</span>
              <div className="flex gap-1.5">
                {['4', '4.5', '5'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setRatingMax(ratingMax === v ? '' : v)}
                    className={`px-3 py-1 rounded-lg text-sm border transition-all ${
                      ratingMax === v
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {(ratingMin || ratingMax) && (
              <button
                onClick={resetFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {/* Grid */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ShopCardSkeleton key={i} />)
            : (shops ?? []).map((shop, i) => <ShopCard key={shop.id} shop={shop} index={i} />)
          }
        </div>
      )}

      {!loading && !error && (shops ?? []).length === 0 && (
        <div className="text-center py-20 text-muted-foreground animate-fade-up">
          <p className="text-5xl mb-4">🍽</p>
          <p className="font-display text-xl">No restaurants found</p>
          <button onClick={resetFilters} className="mt-3 text-sm text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
