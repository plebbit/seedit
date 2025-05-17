import { useEffect, useRef, useReducer, useCallback } from 'react';

const useDisplayedSubscriptions = (initialListFactory: () => string[], resetDeps: any[] = []) => {
  const list = initialListFactory(); // should be cheap or memoized by caller

  const unsubscribedRef = useRef<Set<string>>(new Set());

  // Reset unsubscribed flags when reset deps change (e.g. account author change)
  useEffect(() => {
    unsubscribedRef.current.clear();
  }, [unsubscribedRef, ...resetDeps]);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleUnsubscribe = useCallback((address: string) => {
    unsubscribedRef.current.add(address);
    forceUpdate();
  }, []);

  const isUnsubscribed = useCallback((address: string) => unsubscribedRef.current.has(address), []);

  return { list, isUnsubscribed, handleUnsubscribe };
};

export default useDisplayedSubscriptions;
