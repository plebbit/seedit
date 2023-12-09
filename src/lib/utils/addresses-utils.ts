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

export const useDefaultAndSubscriptionsSubplebbits = (): SubplebbitWithDisplay[] => {
  const account = useAccount();
  const { subplebbitAddress: subplebbitAddressParam } = useParams();
  const defaultSubplebbits = useDefaultSubplebbits();

  return useMemo(() => {
    const subplebbitsObj: { [key: string]: SubplebbitWithDisplay } = {};

    const addSubplebbit = (subplebbit: Subplebbit) => {
      let displayAddress = subplebbit.address.includes('.') ? subplebbit.address : getShortAddress(subplebbit.address);

      // Append title in parentheses only if the address doesn't contain '.'
      if (!subplebbit.address.includes('.') && subplebbit.title) {
        displayAddress += ` (${subplebbit.title})`;
      }

      if (displayAddress.length > 40) {
        displayAddress = displayAddress.substring(0, 37) + '...';
      }

      subplebbitsObj[subplebbit.address] = { ...subplebbit, displayAddress };
    };

    // Add default subplebbits
    defaultSubplebbits.forEach(subplebbit => {
      if (subplebbit.address) {
        addSubplebbit(subplebbit);
      }
    });

    // Add subscribed subplebbits
    account?.subscriptions?.forEach((address: string) => {
      if (!subplebbitsObj[address]) {
        addSubplebbit({ address });
      }
    });

    // Add the current subplebbit if not already in the list
    if (subplebbitAddressParam && !subplebbitsObj[subplebbitAddressParam]) {
      addSubplebbit({ address: subplebbitAddressParam });
    }

    return Object.values(subplebbitsObj);
  }, [account?.subscriptions, defaultSubplebbits, subplebbitAddressParam]);
};
