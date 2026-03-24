import { useState } from 'react';
import { SlidersHorizontal, Plus, Check } from 'lucide-react';
import { api, type Product } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useFetch } from '@/lib/useFetch';
import { useInfiniteScroll } from '@/lib/useInfiniteScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import { Img } from '@/components/Img';
import { toast } from 'sonner';

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'name_asc', label: 'Name A–Z' },
] as const;

function ProductCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCart((s) => s.addItem);
  const inCart = useCart((s) => s.items.some((i) => i.product.id === product.id));
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setJustAdded(true);
    toast.success(`${product.name} added to cart`, { duration: 1500 });
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className={`group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${Math.min(index % 4 + 1, 4)}`}>
      <div className="aspect-3/2 overflow-hidden bg-secondary relative">
        <Img
          src={product.imageUrl}
          alt={product.name}
          placeholderIcon="🍔"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className="absolute top-2 right-2 text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm px-2 py-0.5 rounded-md">
          {product.category}
        </span>
      </div>
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">{product.name}</h3>
          <p className="font-display text-lg text-primary">${product.price.toFixed(2)}</p>
        </div>
        <button
          onClick={handleAdd}
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${
            justAdded
              ? 'bg-green-500 text-white scale-90'
              : inCart
              ? 'bg-green-500/90 text-white hover:bg-green-600'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
          }`}
        >
          {inCart || justAdded ? <Check size={15} /> : <Plus size={15} />}
        </button>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-3/2 w-full" />
      <div className="p-4 flex justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <Skeleton className="w-9 h-9 rounded-lg" />
      </div>
    </div>
  );
}

export function AllProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'name_asc' | ''>('');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: shops } = useFetch(() => api.shops(), []);
  const { data: categories } = useFetch(() => api.categories(), []);

  const { items: products, loading, loadingMore, error, sentinel, refetch } = useInfiniteScroll(
    (cursor) => api.products({
      shopId: selectedShopId || undefined,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      sort: sort || undefined,
      cursor,
      limit: 12,
    }),
    [selectedShopId, selectedCategories, sort],
  );

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const hasFilters = selectedCategories.length > 0 || sort || selectedShopId;

  const resetFilters = () => {
    setSelectedCategories([]);
    setSort('');
    setSelectedShopId('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 animate-fade-up">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">
            All restaurants
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-light">
            Browse <em>dishes</em>
          </h1>
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${
            filtersOpen || hasFilters
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </button>
      </div>

      {/* Sort bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 animate-fade-up stagger-1">
        {SORT_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setSort(sort === o.value ? '' : o.value)}
            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
              sort === o.value
                ? 'border-primary text-primary bg-primary/10'
                : 'border-border text-muted-foreground hover:border-foreground/30'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="mb-6 p-5 bg-card border border-border rounded-xl space-y-5 animate-fade-up">
          {/* Restaurant filter */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Restaurant</p>
            <div className="flex flex-wrap gap-2">
              {(shops ?? []).map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(selectedShopId === shop.id ? '' : shop.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    selectedShopId === shop.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {shop.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {(categories ?? []).map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    selectedCategories.includes(cat)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && <ErrorState message={error} onRetry={refetch} />}

      {/* Grid */}
      {!error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
          {loadingMore && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`more-${i}`} />)}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 animate-fade-up">
          <p className="text-5xl mb-4">🍽</p>
          <p className="font-display text-xl text-muted-foreground">No dishes found</p>
          <button onClick={resetFilters} className="mt-3 text-sm text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}

      <div ref={sentinel} className="h-4" />
    </div>
  );
}
