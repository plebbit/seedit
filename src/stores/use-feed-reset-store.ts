import { create } from 'zustand';

interface FeedResetState {
  reset: (() => void) | null;
  setResetFunction: (resetFunction: () => void) => void;
}

const useFeedResetStore = create<FeedResetState>((set) => ({
  reset: null,
  setResetFunction: (resetFunction) => set({ reset: resetFunction }),
}));

export default useFeedResetStore;
