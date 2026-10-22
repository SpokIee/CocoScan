import { useCallback, useEffect, useRef, useState } from 'react';

import { AppError } from '@/types';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload(): void;
}

export function errorMessage(e: unknown): string {
  if (e instanceof AppError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Something went wrong. Please try again.';
}

/** Runs an async loader on mount and whenever `deps` change. */
export function useAsync<T>(loader: () => Promise<T>, deps: React.DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const latest = useRef(0);

  useEffect(() => {
    const id = ++latest.current;
    setLoading(true);
    setError(null);
    loader()
      .then((d) => {
        if (latest.current === id) setData(d);
      })
      .catch((e: unknown) => {
        if (latest.current === id) setError(errorMessage(e));
      })
      .finally(() => {
        if (latest.current === id) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}
