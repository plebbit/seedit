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
  const { subplebbitAddress: subplebbitAddressParam } = useParams();
  const defaultSubplebbits = useDefaultSubplebbits();

  return useMemo(() => {
    let subplebbitsList: SubplebbitWithDisplay[] = [];

    // Add default subplebbits
    defaultSubplebbits.forEach(subplebbit => {
      if (!subplebbit.address) {
        return;
      }
      let displayAddress = subplebbit.address.includes('.') ? subplebbit.address : getShortAddress(subplebbit.address);

      // Append title in parentheses only if the address doesn't contain '.'
      if (!subplebbit.address.includes('.') && subplebbit.title) {
        displayAddress += ` (${subplebbit.title})`;
      }

      if (displayAddress.length > 40) {
        displayAddress = displayAddress.substring(0, 37) + '...';
      }
      subplebbitsList.push({ address: subplebbit.address, displayAddress });
    });

    // Add subscribed subplebbits
    if (Array.isArray(account?.subscriptions)) {
      account.subscriptions.forEach(address => {
        if (!subplebbitsList.some(s => s.address === address)) {
          const displayAddress = address.includes('.') ? address : getShortAddress(address);
          subplebbitsList.push({ address, displayAddress });
        }
      });
    }

    // Add the current subplebbit if not already in the list
    if (subplebbitAddressParam && !subplebbitsList.some(s => s.address === subplebbitAddressParam)) {
      const displayAddress = subplebbitAddressParam.includes('.') ? subplebbitAddressParam : getShortAddress(subplebbitAddressParam);
      subplebbitsList.push({ address: subplebbitAddressParam, displayAddress });
    }

    return subplebbitsList;
  }, [account?.subscriptions, defaultSubplebbits, subplebbitAddressParam]);
};
