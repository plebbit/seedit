import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import { getShortAddress } from '@plebbit/plebbit-js';
import useDefaultSubplebbits from '../../hooks/use-default-subplebbits';

interface Subplebbit {
  title?: string;
  address: string;
  tags?: string[];
  features?: string[];
}

export interface SubplebbitWithDisplay extends Subplebbit {
  displayAddress: string;
}

export const useDefaultSubplebbitAddresses = () => {
  const defaultSubplebbits = useDefaultSubplebbits();
  return useMemo(() => defaultSubplebbits.map((subplebbit: Subplebbit) => subplebbit.address), [defaultSubplebbits]);
};

export const useDefaultAndSubscriptionsSubplebbits = () => {
  const account = useAccount();
  const {subplebbitAddress: subplebbitAddressParam} = useParams();
  const defaultSubplebbits = useDefaultSubplebbits();

  return useMemo(() => {
    const subplebbits: Record<string, SubplebbitWithDisplay> = {};
    // Add subplebbit from params first for visibility
    if (subplebbitAddressParam) {
      subplebbits[subplebbitAddressParam] = {
        address: subplebbitAddressParam, 
        displayAddress: subplebbitAddressParam.includes('.') ? subplebbitAddressParam : getShortAddress(subplebbitAddressParam)
      };
    }
    if (Array.isArray(account?.subscriptions)) {
      for (const address of account.subscriptions) {
        subplebbits[address] = {
          address, 
          displayAddress: address.includes('.') ? address : getShortAddress(address)
        };
      }
    }
    for (const subplebbit of defaultSubplebbits) {
      if (!subplebbit.address) {
        continue;
      }
      let displayAddress = subplebbit.address.includes('.') ? subplebbit.address : getShortAddress(subplebbit.address);
    
      // Append title in parentheses only if the address doesn't contain '.'
      if (!subplebbit.address.includes('.') && subplebbit.title) {
        displayAddress += ` (${subplebbit.title})`;
      }
    
      if (displayAddress.length > 40) {
        displayAddress = displayAddress.substring(0, 37) + '...';
      }
      subplebbits[subplebbit.address] = { address: subplebbit.address, displayAddress };
    }

    return Object.values(subplebbits);
  }, [account?.subscriptions, defaultSubplebbits, subplebbitAddressParam]);
};