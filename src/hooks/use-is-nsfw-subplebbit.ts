import { useMemo } from 'react';
import { useDefaultSubplebbits } from './use-default-subplebbits';

export const useIsNsfwSubplebbit = (subplebbitAddress: string) => {
  const defaultSubplebbits = useDefaultSubplebbits();

  return useMemo(() => {
    if (!subplebbitAddress || !defaultSubplebbits) return false;

    // Find the subplebbit in the default list
    const subplebbit = defaultSubplebbits.find((sub) => sub.address === subplebbitAddress);

    // Check if the subplebbit has adult or gore tags
    return Boolean(subplebbit?.tags?.includes('adult') || subplebbit?.tags?.includes('gore'));
  }, [subplebbitAddress, defaultSubplebbits]);
};
