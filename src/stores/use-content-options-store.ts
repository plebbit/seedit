import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ContentOptionsState {
  blurNsfwThumbnails: boolean;
  hideAdultCommunities: boolean;
  hideGoreCommunities: boolean;
  hideAntiCommunities: boolean;
  hideVulgarCommunities: boolean;
  setBlurNsfwThumbnails: (blur: boolean) => void;
  setHideAdultCommunities: (hide: boolean) => void;
  setHideGoreCommunities: (hide: boolean) => void;
  setHideAntiCommunities: (hide: boolean) => void;
  setHideVulgarCommunities: (hide: boolean) => void;
}

const useContentOptionsStore = create<ContentOptionsState>()(
  persist(
    (set) => ({
      blurNsfwThumbnails: true,
      hideAdultCommunities: true,
      hideGoreCommunities: true,
      hideAntiCommunities: true,
      hideVulgarCommunities: true,
      setBlurNsfwThumbnails: (blur) => set({ blurNsfwThumbnails: blur }),
      setHideAdultCommunities: (hide) => set({ hideAdultCommunities: hide }),
      setHideGoreCommunities: (hide) => set({ hideGoreCommunities: hide }),
      setHideAntiCommunities: (hide) => set({ hideAntiCommunities: hide }),
      setHideVulgarCommunities: (hide) => set({ hideVulgarCommunities: hide }),
    }),
    {
      name: 'content-options',
    },
  ),
);

export default useContentOptionsStore;
