import { create } from 'zustand';

export type NodeReachability = 'public' | 'private' | 'unknown';

interface NodeReachabilityStore {
  reachability: NodeReachability;
  checkedAt?: number;
  setReachability: (reachability: NodeReachability) => void;
}

// The desktop app runs one node, so its verdict is shared and survives the sidebar remounting on navigation.
const useNodeReachabilityStore = create<NodeReachabilityStore>((set) => ({
  reachability: 'unknown',
  setReachability: (reachability) => set({ reachability, checkedAt: Date.now() }),
}));

export default useNodeReachabilityStore;
