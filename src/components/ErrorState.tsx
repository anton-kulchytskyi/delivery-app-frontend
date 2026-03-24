interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-20 animate-fade-up">
      <p className="text-4xl mb-4">⚠️</p>
      <p className="font-display text-xl text-muted-foreground mb-2">Something went wrong</p>
      <p className="text-sm text-muted-foreground/60 mb-6 max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
