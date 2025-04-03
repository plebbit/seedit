import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeedFiltersStore {
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
}

const useFeedFiltersStore = create<FeedFiltersStore>()(
  persist(
    (set) => ({
      isSearching: false,
      setIsSearching: (isSearching) => set({ isSearching }),
    }),
    { name: 'feed-filters-searching' },
  ),
);

export default useFeedFiltersStore;
