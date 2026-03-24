import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Clock, Tag, Store, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { useCart } from '@/lib/cart';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  isCart?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/shops', label: 'Restaurants', icon: Store },
  { to: '/browse', label: 'Products', icon: UtensilsCrossed },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/coupons', label: 'Coupons', icon: Tag },
  { to: '/cart', label: 'Cart', icon: ShoppingBag, isCart: true },
];

export function Navbar() {
  const location = useLocation();
  const itemCount = useCart((s) => s.totalItems());

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-primary text-2xl">◆</span>
            <span className="font-display text-xl font-medium tracking-tight">
              Deliver
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.filter((item) => !item.isCart).map(({ to, label, icon: Icon }) => (
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
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile bottom bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/60">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ to, label, icon: Icon, isCart }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  active
                    ? isCart ? 'text-primary' : 'text-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  {isCart && itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1">
                      {itemCount}
                    </span>
                  )}
                </div>
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer so content isn't hidden behind mobile bottom bar */}
      <div className="sm:hidden h-16" />
    </>
  );
}
