import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';

interface Subplebbit {
  title?: string;
  address: string;
  tags?: string[];
  features?: string[];
}

export interface SubplebbitWithDisplay extends Subplebbit {
  displayAddress: string;
}

let cache: Subplebbit[] | null = null;

export const useDefaultSubplebbits = () => {
  const [subplebbits, setSubplebbits] = useState<Subplebbit[]>([]);

  useEffect(() => {
    if (cache) {
      return;
    }
    (async () => {
      try {
        const multisub = await fetch(
          'https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/multisub.json',
          // { cache: 'no-cache' }
        ).then((res) => res.json());
        cache = multisub.subplebbits;
        setSubplebbits(multisub.subplebbits);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return cache || subplebbits;
};

export const useDefaultSubplebbitAddresses = () => {
  const defaultSubplebbits = useDefaultSubplebbits();
  return useMemo(() => defaultSubplebbits.map((subplebbit: Subplebbit) => subplebbit.address), [defaultSubplebbits]);
};

export const useDefaultAndSubscriptionsSubplebbitAddresses = () => {
  const subscriptions = useAccount()?.subscriptions ?? [];
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();

  return useMemo(() => {
    const subplebbitAddresses = new Set(defaultSubplebbitAddresses);

    subscriptions.forEach((address: string) => {
      subplebbitAddresses.add(address);
    });

    return Array.from(subplebbitAddresses);
  }, [subscriptions, defaultSubplebbitAddresses]);
};

export const useDefaultAndSubscriptionsSubplebbits = (): SubplebbitWithDisplay[] => {
  const account = useAccount();
  const { subplebbitAddress: subplebbitAddressParam } = useParams();
  const defaultSubplebbits = useDefaultSubplebbits();

  return useMemo(() => {
    const subplebbitsObj: { [key: string]: SubplebbitWithDisplay } = {};

    const addSubplebbit = (subplebbit: Subplebbit) => {
      let displayAddress = subplebbit.address.includes('.') ? subplebbit.address : Plebbit.getShortAddress(subplebbit.address);

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
    defaultSubplebbits.forEach((subplebbit) => {
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
