import { useEffect, useRef, useReducer, useCallback, useState } from 'react';

const useDisplayedSubscriptions = (
  getCurrentList: () => string[],
  resetDependencies: readonly any[], // Dependencies that trigger a full list reset
) => {
  // Ref to store the latest getCurrentList to avoid including it in the main effect's dependencies,
  // which could cause unnecessary re-runs if the function reference changes too often.
  const getCurrentListRef = useRef(getCurrentList);
  useEffect(() => {
    getCurrentListRef.current = getCurrentList;
  }, [getCurrentList]);

  const [displayedList, setDisplayedList] = useState(() => getCurrentListRef.current());

  const unsubscribedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setDisplayedList(getCurrentListRef.current());
    unsubscribedRef.current.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDependencies); // Intentionally uses resetDependencies directly for this effect

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleUnsubscribe = useCallback((address: string) => {
    unsubscribedRef.current.add(address);
    forceUpdate(); // Force re-render to apply visual style via isUnsubscribed
  }, []);

  const isUnsubscribed = useCallback((address: string) => unsubscribedRef.current.has(address), []);

  return { list: displayedList, isUnsubscribed, handleUnsubscribe };
};

export default useDisplayedSubscriptions;
