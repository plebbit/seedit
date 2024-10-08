import { create } from 'zustand';

interface NotFoundState {
  isNotFound: boolean;
  setNotFound: (isNotFound: boolean) => void;
}

export const useNotFoundStore = create<NotFoundState>((set) => ({
  isNotFound: false,
  setNotFound: (isNotFound: boolean) => set({ isNotFound }),
}));

export default useNotFoundStore;
