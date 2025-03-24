import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeedFiltersStore {
  searchFilter: string;
  isSearching: boolean;
  setSearchFilter: (filter: string) => void;
  clearSearchFilter: () => void;
  setIsSearching: (isSearching: boolean) => void;
}

const useFeedFiltersStore = create<FeedFiltersStore>()(
  persist(
    (set) => ({
      searchFilter: '',
      isSearching: false,
      setSearchFilter: (filter) => set({ searchFilter: filter }),
      clearSearchFilter: () => set({ searchFilter: '', isSearching: false }),
      setIsSearching: (isSearching) => set({ isSearching }),
    }),
    { name: 'feed-filters' },
  ),
);

export default useFeedFiltersStore;
