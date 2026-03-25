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
  const mergeReorder = useCart((s) => s.mergeReorder);
  const [expanded, setExpanded] = useState(false);
  const [reordering, setReordering] = useState(false);

  const customerState = { name: order.name, email: order.email, phone: order.phone, address: order.address };

  const handleReorder = async () => {
    setReordering(true);
    try {
      const apiItems = await api.reorder(order.id);
      const cartItems = apiItems.flatMap((item) => {
        const orderItem = order.items.find((oi) => oi.productId === item.productId);
        return orderItem ? [{ productId: item.productId, quantity: item.quantity, product: orderItem.product }] : [];
      });
      mergeReorder(cartItems);
    } catch {
      mergeReorder(
        order.items.map((item) => ({ productId: item.productId, quantity: item.quantity, product: item.product })),
      );
    } finally {
      setReordering(false);
      toast.success('Items added to cart');
      navigate('/cart', { state: customerState });
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

type SearchMode = 'phone' | 'id';

export function HistoryPage() {
  const [mode, setMode] = useState<SearchMode>('phone');
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'phone') {
      const trimmed = phone.trim();
      if (!trimmed) { setError('Please enter your phone number'); return; }
      setLoading(true);
      try {
        const data = await api.searchOrders({ phone: trimmed });
        setOrders(data);
        if (data.length === 0) setError('No orders found for this phone number');
      } catch {
        setError('Could not find orders. Make sure the phone number matches the one you used when ordering.');
      } finally {
        setLoading(false);
      }
    } else {
      const trimmed = orderId.trim();
      if (!trimmed) { setError('Please enter an order ID'); return; }
      setLoading(true);
      try {
        const data = await api.searchOrders({ id: trimmed });
        setOrders(data);
        if (data.length === 0) setError('No order found with this ID');
      } catch {
        setError('Invalid order ID format');
      } finally {
        setLoading(false);
      }
    }
  };

  const switchMode = (next: SearchMode) => {
    setMode(next);
    setOrders(null);
    setError('');
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
        <div className="flex gap-1 mb-4 p-1 bg-secondary rounded-lg w-fit">
          <button
            type="button"
            onClick={() => switchMode('phone')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'phone'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By phone
          </button>
          <button
            type="button"
            onClick={() => switchMode('id')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === 'id'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            By order ID
          </button>
        </div>

        <div className="flex gap-3">
          {mode === 'phone' ? (
            <Input
              placeholder="+380991234567"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              className={`bg-secondary border-border text-sm flex-1 ${error ? 'border-destructive' : ''}`}
            />
          ) : (
            <Input
              placeholder="Paste your order ID"
              type="text"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setError(''); }}
              className={`bg-secondary border-border text-sm flex-1 font-mono ${error ? 'border-destructive' : ''}`}
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0"
          >
            <Search size={14} />
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-muted-foreground bg-secondary rounded-lg px-4 py-3 border border-border">
            {error}
          </p>
        )}
      </form>

      {/* Results */}
      {loading && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-5 bg-card border border-border rounded-xl">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </div>
      )}

      {orders !== null && !loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
