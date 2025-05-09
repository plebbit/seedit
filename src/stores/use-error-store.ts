import { create } from 'zustand';

interface ErrorStoreState {
  errors: Record<string, Error | null>;
  setError: (source: string, error: Error | null | undefined) => void;
  clearAllErrors: () => void;
}

const useErrorStore = create<ErrorStoreState>((set) => ({
  errors: {},
  setError: (source, error) =>
    set((state) => {
      const newErrors = { ...state.errors };
      if (error) {
        newErrors[source] = error;
      } else {
        delete newErrors[source];
      }
      return { errors: newErrors };
    }),
  clearAllErrors: () => set({ errors: {} }),
}));

export default useErrorStore;
