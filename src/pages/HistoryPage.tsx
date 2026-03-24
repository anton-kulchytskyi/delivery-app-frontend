import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { api, type Order } from '@/lib/api';
import { Img } from '@/components/Img';
import { useCart } from '@/lib/cart';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const { mergeReorder, addItem } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    setReordering(true);
    try {
      const items = await api.reorder(order.id);
      // items come with product data from the order
      for (const item of items) {
        const orderItem = order.items.find((oi) => oi.productId === item.productId);
        if (orderItem) {
          mergeReorder([{ productId: item.productId, quantity: item.quantity, product: orderItem.product }]);
        }
      }
      toast.success('Items added to cart');
      navigate('/cart');
    } catch (err) {
      // Fallback: use products from the order directly
      for (const item of order.items) {
        addItem(item.product, item.quantity);
      }
      toast.success('Items added to cart');
      navigate('/cart');
    } finally {
      setReordering(false);
    }
  };

  const date = new Date(order.createdAt).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-fade-up">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1 font-mono">{order.id.slice(0, 8)}…</p>
            <p className="font-display text-lg font-light">{order.name}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{date} · {order.address}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-xl text-primary">${order.totalPrice.toFixed(2)}</p>
            {order.discount > 0 && (
              <p className="text-xs text-green-400">−${order.discount.toFixed(2)} saved</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            <RotateCcw size={13} className={reordering ? 'animate-spin' : ''} />
            Reorder
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 border-b border-border/50 last:border-0">
              <Img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-10 h-10 rounded-lg object-cover bg-secondary shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm line-clamp-1">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">${item.priceAtOrder.toFixed(2)} each</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">×{item.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HistoryPage() {
  const [searchMode, setSearchMode] = useState<'id' | 'contact'>('contact');
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params =
        searchMode === 'id'
          ? { id: orderId.trim() }
          : { email: email.trim(), phone: phone.trim() };
      const data = await api.searchOrders(params);
      setOrders(data);
    } catch (err) {
      toast.error((err as Error).message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="animate-fade-up mb-8">
        <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">Track</p>
        <h1 className="font-display text-4xl sm:text-5xl font-light">Order <em>history</em></h1>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="p-5 bg-card border border-border rounded-xl mb-8 animate-fade-up stagger-1">
        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit mb-5">
          {(['contact', 'id'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSearchMode(mode)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                searchMode === mode
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'contact' ? 'Email + Phone' : 'Order ID'}
            </button>
          ))}
        </div>

        {searchMode === 'contact' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border text-sm"
            />
            <Input
              placeholder="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-secondary border-border text-sm"
            />
          </div>
        ) : (
          <div className="mb-4">
            <Input
              placeholder="Order ID (UUID)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-secondary border-border text-sm font-mono"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          <Search size={14} />
          {loading ? 'Searching…' : 'Search orders'}
        </button>
      </form>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 bg-card border border-border rounded-xl">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </div>
      )}

      {orders !== null && !loading && (
        orders.length === 0 ? (
          <div className="text-center py-12 animate-fade-up">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-display text-xl text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
