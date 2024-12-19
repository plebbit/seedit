import { useMemo } from 'react';
import { useDefaultSubplebbits } from './use-default-subplebbits';

const SENSITIVE_TAGS = ['adult', 'gore', 'anti', 'vulgar'];

export const useIsBroadlyNsfwSubplebbit = (subplebbitAddress: string) => {
  const defaultSubplebbits = useDefaultSubplebbits();

  return useMemo(() => {
    if (!subplebbitAddress || !defaultSubplebbits) return false;

    // Find the subplebbit in the default list
    const subplebbit = defaultSubplebbits.find((sub) => sub.address === subplebbitAddress);

    // Check if the subplebbit has any of the sensitive tags
    return Boolean(subplebbit?.tags?.some((tag) => SENSITIVE_TAGS.includes(tag)));
  }, [subplebbitAddress, defaultSubplebbits]);
};
