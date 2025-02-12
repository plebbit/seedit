import { create } from 'zustand';

interface AutoSubscribeState {
  checkingAccounts: Set<string>;
  addCheckingAccount: (address: string) => void;
  removeCheckingAccount: (address: string) => void;
  isCheckingAccount: (address: string) => boolean;
  reset: () => void;
}

export const useAutoSubscribeStore = create<AutoSubscribeState>((set, get) => ({
  checkingAccounts: new Set(),
  addCheckingAccount: (address) =>
    set((state) => ({
      checkingAccounts: new Set(state.checkingAccounts).add(address),
    })),
  removeCheckingAccount: (address) =>
    set((state) => {
      const newSet = new Set(state.checkingAccounts);
      newSet.delete(address);
      return { checkingAccounts: newSet };
    }),
  isCheckingAccount: (address) => get().checkingAccounts.has(address),
  reset: () => set({ checkingAccounts: new Set() }),
}));
