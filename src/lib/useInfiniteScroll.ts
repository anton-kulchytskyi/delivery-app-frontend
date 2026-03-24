import { useState, useEffect, useRef, useCallback } from 'react';

interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

interface InfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  sentinel: React.RefObject<HTMLDivElement | null>;
  refetch: () => void;
}

export function useInfiniteScroll<T>(
  fetcher: (cursor?: string) => Promise<Page<T>>,
  deps: unknown[],
): InfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const load = useCallback((reset: boolean, cursor?: string) => {
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    fetcherRef.current(cursor)
      .then((page) => {
        setItems((prev) => reset ? page.data : [...prev, ...page.data]);
        setNextCursor(page.nextCursor);
        setError(null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Something went wrong';
        setError(message);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Reset and reload when deps change
  useEffect(() => {
    setNextCursor(null);
    load(true);
  }, [load]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinel.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor && !loadingMore) {
          load(false, nextCursor);
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(sentinel.current);
    return () => obs.disconnect();
  }, [nextCursor, loadingMore, load]);

  return { items, loading, loadingMore, error, sentinel, refetch: () => load(true) };
}
