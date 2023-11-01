import useDefaultSubplebbits from './use-default-subplebbits';
import { useMemo } from 'react';

interface Subplebbit {
  title?: string;
  address: string;
  tags?: string[];
  features?: string[];
}

const useDefaultSubplebbitAddresses = () => {
  const defaultSubplebbits = useDefaultSubplebbits();
  return useMemo(() => defaultSubplebbits.map((subplebbit: Subplebbit) => subplebbit.address), [defaultSubplebbits]);
};

export default useDefaultSubplebbitAddresses;
