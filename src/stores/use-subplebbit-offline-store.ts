import { create } from 'zustand';

interface SubplebbitOfflineState {
  state?: string;
  updatedAt?: number;
  updatingState?: string;
  initialLoad: boolean;
}

interface SubplebbitOfflineStore {
  subplebbitOfflineState: Record<string, SubplebbitOfflineState>;
  setSubplebbitOfflineState: (address: string, state: Partial<SubplebbitOfflineState>) => void;
  initializesubplebbitOfflineState: (address: string) => void;
}

const useSubplebbitOfflineStore = create<SubplebbitOfflineStore>((set) => ({
  subplebbitOfflineState: {},
  setSubplebbitOfflineState: (address, newState) =>
    set((state) => ({
      subplebbitOfflineState: {
        ...state.subplebbitOfflineState,
        [address]: {
          ...state.subplebbitOfflineState[address],
          ...newState,
        },
      },
    })),
  initializesubplebbitOfflineState: (address) => {
    set((state) => ({
      subplebbitOfflineState: {
        ...state.subplebbitOfflineState,
        [address]: {
          initialLoad: true,
        },
      },
    }));
    setTimeout(() => {
      set((state) => ({
        subplebbitOfflineState: {
          ...state.subplebbitOfflineState,
          [address]: {
            ...state.subplebbitOfflineState[address],
            initialLoad: false,
          },
        },
      }));
    }, 30000);
  },
}));

export default useSubplebbitOfflineStore;
