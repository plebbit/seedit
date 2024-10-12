import { useEffect, useMemo } from 'react';
import { create } from 'zustand';

interface SubplebbitsLoadingStartTimestampsState {
  timestamps: Record<string, number>;
  addSubplebbits: (subplebbitAddresses: string[]) => void;
}

const useSubplebbitsLoadingStartTimestampsStore = create<SubplebbitsLoadingStartTimestampsState>((set, get) => ({
  timestamps: {},
  addSubplebbits: (subplebbitAddresses) => {
    const { timestamps } = get();
    const newTimestamps: Record<string, number> = {};
    subplebbitAddresses.forEach((subplebbitAddress) => {
      if (!timestamps[subplebbitAddress]) {
        newTimestamps[subplebbitAddress] = Math.round(Date.now() / 1000);
      }
    });
    if (Object.keys(newTimestamps).length) {
      set((state) => ({ timestamps: { ...state.timestamps, ...newTimestamps } }));
    }
  },
}));

const useSubplebbitsLoadingStartTimestamps = (subplebbitAddresses?: string[]) => {
  const timestampsStore = useSubplebbitsLoadingStartTimestampsStore((state) => state.timestamps);
  const addSubplebbits = useSubplebbitsLoadingStartTimestampsStore((state) => state.addSubplebbits);

  useEffect(() => {
    if (subplebbitAddresses) {
      addSubplebbits(subplebbitAddresses);
    }
  }, [subplebbitAddresses, addSubplebbits]);

  const subplebbitsLoadingStartTimestamps = useMemo(() => {
    return subplebbitAddresses?.map((subplebbitAddress) => timestampsStore[subplebbitAddress]) || [];
  }, [timestampsStore, subplebbitAddresses]);

  return subplebbitsLoadingStartTimestamps;
};

export default useSubplebbitsLoadingStartTimestamps;
