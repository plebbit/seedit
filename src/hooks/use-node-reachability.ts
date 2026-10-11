import { useEffect } from 'react';
import useNodeReachabilityStore, { type NodeReachability } from '../stores/use-node-reachability-store';

// The node's AutoNAT verdict takes a few minutes after startup and changes with the network, so keep asking.
const POLL_INTERVAL_MS = 60_000;

/** Whether the desktop app's own node can be reached from the internet. Always 'unknown' outside the desktop app. */
export const useNodeReachability = (enabled: boolean): NodeReachability => {
  const reachability = useNodeReachabilityStore((state) => state.reachability);
  const setReachability = useNodeReachabilityStore((state) => state.setReachability);

  useEffect(() => {
    const getNodeReachability = window.electronApi?.getNodeReachability;
    if (!enabled || !getNodeReachability) {
      return;
    }
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const checkAndReschedule = () => {
      getNodeReachability()
        .then(setReachability)
        .catch(() => {});
      timeout = setTimeout(checkAndReschedule, POLL_INTERVAL_MS);
    };
    // A remount after navigation keeps the shared verdict and waits for the next due check instead of asking again.
    const { checkedAt } = useNodeReachabilityStore.getState();
    const delay = checkedAt === undefined ? 0 : Math.max(0, checkedAt + POLL_INTERVAL_MS - Date.now());
    timeout = setTimeout(checkAndReschedule, delay);
    return () => clearTimeout(timeout);
  }, [enabled, setReachability]);

  return enabled ? reachability : 'unknown';
};
