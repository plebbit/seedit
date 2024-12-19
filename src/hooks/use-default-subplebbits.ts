import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import useFilterSettingsStore from '../stores/use-filter-settings-store';

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

export const categorizeSubplebbits = (subplebbits: Subplebbit[]) => {
  const plebbitSubs = subplebbits.filter((sub) => sub.tags?.includes('plebbit'));
  const interestsSubs = subplebbits.filter(
    (sub) => sub.tags?.includes('topic') && !sub.tags?.includes('plebbit') && !sub.tags?.includes('country') && !sub.tags?.includes('international'),
  );
  const randomSubs = subplebbits.filter((sub) => sub.tags?.includes('random') && !sub.tags?.includes('plebbit'));
  const internationalSubs = subplebbits.filter((sub) => sub.tags?.includes('international') || sub.tags?.includes('country'));
  const projectsSubs = subplebbits.filter((sub) => sub.tags?.includes('project') && !sub.tags?.includes('plebbit') && !sub.tags?.includes('topic'));

  return { plebbitSubs, interestsSubs, randomSubs, internationalSubs, projectsSubs };
};

export const useDefaultSubplebbits = () => {
  const [subplebbits, setSubplebbits] = useState<Subplebbit[]>([]);
  const { hideAdultCommunities, hideGoreCommunities, hideAntiCommunities, hideVulgarCommunities } = useFilterSettingsStore();

  useEffect(() => {
    if (cache) {
      return;
    }
    (async () => {
      try {
        const multisub = await fetch('https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/multisub.json').then((res) => res.json());

        const filteredSubplebbits = multisub.subplebbits.filter((subplebbit: Subplebbit) => {
          const tags = subplebbit.tags || [];

          if (hideAdultCommunities && tags.includes('adult')) return false;
          if (hideGoreCommunities && tags.includes('gore')) return false;
          if (hideAntiCommunities && tags.includes('anti')) return false;
          if (hideVulgarCommunities && tags.includes('vulgar')) return false;
          return true;
        });

        cache = filteredSubplebbits;
        setSubplebbits(filteredSubplebbits);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, [hideAdultCommunities, hideGoreCommunities, hideAntiCommunities, hideVulgarCommunities]);

  return cache || subplebbits;
};

export const useDefaultSubplebbitAddresses = () => {
  const defaultSubplebbits = useDefaultSubplebbits();
  const categorizedSubplebbits = useMemo(() => categorizeSubplebbits(defaultSubplebbits), [defaultSubplebbits]);
  return useMemo(
    () =>
      [
        ...categorizedSubplebbits.plebbitSubs,
        ...categorizedSubplebbits.interestsSubs,
        ...categorizedSubplebbits.randomSubs,
        ...categorizedSubplebbits.projectsSubs,
        ...categorizedSubplebbits.internationalSubs,
      ].map((subplebbit) => subplebbit.address),
    [categorizedSubplebbits],
  );
};

export const useDefaultAndSubscriptionsSubplebbitAddresses = () => {
  const account = useAccount();
  const subscriptions = useMemo(() => account?.subscriptions ?? [], [account?.subscriptions]);
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
