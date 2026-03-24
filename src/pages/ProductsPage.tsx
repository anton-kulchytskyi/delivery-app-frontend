import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Check, SlidersHorizontal } from 'lucide-react';
import { api, type Product, type Shop } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { useFetch } from '@/lib/useFetch';
import { useInfiniteScroll } from '@/lib/useInfiniteScroll';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ErrorState';
import { toast } from 'sonner';
import { Img } from '@/components/Img';

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
    <div
      className={`group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 animate-fade-up stagger-${Math.min(index % 4 + 1, 4)}`}
    >
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

export function ProductsPage() {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const shopFromState = ((location.state ?? {}) as { shop?: Shop }).shop ?? null;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sort, setSort] = useState<'price_asc' | 'price_desc' | 'name_asc' | ''>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories } = useFetch(() => api.categories(), []);

  // Only fetch shop if not passed via router state
  const { data: fetchedShop } = useFetch(
    () => shopFromState ? Promise.resolve(shopFromState) : api.shop(shopId!),
    [shopId],
  );
  const shop = shopFromState ?? fetchedShop;

  const { items: products, loading, loadingMore, error, sentinel, refetch } = useInfiniteScroll(
    (cursor) => api.products({
      shopId: shopId!,
      category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      sort: sort || undefined,
      cursor,
      limit: 12,
    }),
    [shopId, selectedCategories, sort],
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const cartCount = useCart((s) => s.totalItems());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="animate-fade-up mb-8">
        <button
          onClick={() => navigate('/shops')}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5"
        >
          <ArrowLeft size={14} />
          All restaurants
        </button>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">
              {shop?.category ?? ''}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-light">
              {shop?.name ?? <Skeleton className="h-10 w-64" />}
            </h1>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="relative shrink-0 flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Cart
            {cartCount > 0 && (
              <span className="bg-primary-foreground text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 animate-fade-up stagger-1">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${
            filtersOpen || selectedCategories.length > 0
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:border-foreground/30'
          }`}
        >
          <SlidersHorizontal size={12} />
          Filter
          {selectedCategories.length > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {selectedCategories.length}
            </span>
          )}
        </button>

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

      {/* Category chips */}
      {filtersOpen && (
        <div className="mb-6 p-4 bg-card border border-border rounded-xl animate-fade-up">
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
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 px-2"
              >
                Clear
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
            ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
          {loadingMore && Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={`more-${i}`} />)}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-muted-foreground animate-fade-up">
          <p className="text-5xl mb-4">🍽</p>
          <p className="font-display text-xl">No items found</p>
          <button
            onClick={() => setSelectedCategories([])}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      <div ref={sentinel} className="h-4" />
    </div>
  );
}
