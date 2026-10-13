import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> { data: T | null; loading: boolean; error: string | null; reload: () => void }

/** Run an async loader whenever `deps` change, ignoring stale responses. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const run = useRef(0);
  useEffect(() => {
    const id = ++run.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn().then(
      (data) => { if (id === run.current) setState({ data, loading: false, error: null }); },
      (e: unknown) => { if (id === run.current) setState({ data: null, loading: false, error: e instanceof Error ? e.message : 'Something went wrong.' }); },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
