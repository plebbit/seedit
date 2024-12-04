import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AvatarVisibilityState {
  hideAvatars: boolean;
  setHideAvatars: (hide: boolean) => void;
}

const useAvatarVisibilityStore = create<AvatarVisibilityState>()(
  persist(
    (set) => ({
      hideAvatars: false,
      setHideAvatars: (hide) => set({ hideAvatars: hide }),
    }),
    {
      name: 'avatar-visibility-storage',
    },
  ),
);

export default useAvatarVisibilityStore;
