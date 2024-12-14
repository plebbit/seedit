import { create } from 'zustand';

interface PinnedPostsState {
  pinnedPostsCount: number;
  setPinnedPostsCount: (count: number) => void;
}

export const usePinnedPostsStore = create<PinnedPostsState>((set) => ({
  pinnedPostsCount: 0,
  setPinnedPostsCount: (count) => set({ pinnedPostsCount: count }),
}));
