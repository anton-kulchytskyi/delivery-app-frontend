import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Store } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-up">
        <p className="text-xs uppercase tracking-widest text-primary mb-4 font-medium">
          Food delivery
        </p>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light leading-tight mb-6">
          Good food,<br />
          <em className="text-primary">delivered fast</em>
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
          Choose your favourite restaurant or browse all dishes — we'll bring it straight to your door.
        </p>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl animate-fade-up stagger-2">
        <button
          onClick={() => navigate('/shops')}
          className="group relative overflow-hidden flex flex-col items-start gap-4 p-7 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-[0_0_40px_-8px_rgba(249,115,22,0.2)] transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Store size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xl font-light mb-1">Restaurants</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse by restaurant and explore their full menu
            </p>
          </div>
          <span className="text-xs text-primary font-medium mt-auto">
            Browse restaurants →
          </span>
        </button>

        <button
          onClick={() => navigate('/browse')}
          className="group relative overflow-hidden flex flex-col items-start gap-4 p-7 bg-card border border-border rounded-2xl hover:border-primary/50 hover:shadow-[0_0_40px_-8px_rgba(249,115,22,0.2)] transition-all duration-300 text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <UtensilsCrossed size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xl font-light mb-1">All dishes</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Filter by category, sort by price or name across all restaurants
            </p>
          </div>
          <span className="text-xs text-primary font-medium mt-auto">
            Browse all dishes →
          </span>
        </button>
      </div>

      {/* Decorative dots */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
