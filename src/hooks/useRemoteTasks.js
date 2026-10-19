import { useCallback, useEffect, useState } from 'react';
import { fetchRemoteTasks } from '../services/remoteTaskService';
export const REQUEST_TIMEOUT_MS = 15000;
export function useRemoteTasks() {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    async function load() {
      setState((previous) => ({ ...previous, loading: true, error: null }));
      try {
        const data = await fetchRemoteTasks({ signal: controller.signal });
        if (active && !controller.signal.aborted)
          setState({ data, loading: false, error: null });
      } catch (error) {
        if (!active) return;
        if (controller.signal.aborted && !timedOut) return;
        setState((previous) => ({
          ...previous,
          loading: false,
          error: {
            kind: timedOut ? 'timeout' : error.kind || 'network',
            message: timedOut
              ? 'The request took too long. Please try again.'
              : error.message,
          },
        }));
        controller.abort();
      } finally {
        clearTimeout(timer);
      }
    }
    void load();
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [revision]);
  return { ...state, refresh };
}
