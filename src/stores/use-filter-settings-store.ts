import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterSettingsState {
  blurNsfwThumbnails: boolean;
  hideAdultCommunities: boolean;
  hideGoreCommunities: boolean;
  hideAntiCommunities: boolean;
  setBlurNsfwThumbnails: (blur: boolean) => void;
  setHideAdultCommunities: (hide: boolean) => void;
  setHideGoreCommunities: (hide: boolean) => void;
  setHideAntiCommunities: (hide: boolean) => void;
}

const useFilterSettingsStore = create<FilterSettingsState>()(
  persist(
    (set) => ({
      blurNsfwThumbnails: true,
      hideAdultCommunities: true,
      hideGoreCommunities: true,
      hideAntiCommunities: true,
      setBlurNsfwThumbnails: (blur) => set({ blurNsfwThumbnails: blur }),
      setHideAdultCommunities: (hide) => set({ hideAdultCommunities: hide }),
      setHideGoreCommunities: (hide) => set({ hideGoreCommunities: hide }),
      setHideAntiCommunities: (hide) => set({ hideAntiCommunities: hide }),
    }),
    {
      name: 'filter-settings',
    },
  ),
);

export default useFilterSettingsStore;
