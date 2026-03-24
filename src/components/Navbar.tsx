import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Clock, Tag } from 'lucide-react';
import { useCart } from '@/lib/cart';

export function Navbar() {
  const location = useLocation();
  const itemCount = useCart((s) => s.totalItems());

  const links = [
    { to: '/history', label: 'History', icon: Clock },
    { to: '/coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-primary text-2xl">◆</span>
          <span className="font-display text-xl font-medium tracking-tight">
            Deliver
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                location.pathname === to
                  ? 'text-foreground bg-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}

          <Link
            to="/cart"
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ml-1 ${
              location.pathname === '/cart'
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
            }`}
          >
            <ShoppingBag size={16} />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                {itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
