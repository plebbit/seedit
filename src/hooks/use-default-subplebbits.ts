import { useEffect, useMemo, useState } from 'react';
import { Subplebbit, useAccount } from '@plebbit/plebbit-react-hooks';
import useContentOptionsStore from '../stores/use-content-options-store';

export interface MultisubMetadata {
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface MultisubSubplebbit {
  title?: string;
  address: string;
  tags?: string[];
  features?: string[];
}

let cacheSubplebbits: MultisubSubplebbit[] | null = null;
let cacheMetadata: MultisubMetadata | null = null;

export const useDefaultSubplebbits = () => {
  const [subplebbits, setSubplebbits] = useState<MultisubSubplebbit[]>([]);

  useEffect(() => {
    if (cacheSubplebbits) {
      return;
    }
    (async () => {
      try {
        const multisub = await fetch(
          'https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/multisub.json',
          // { cache: 'no-cache' }
        ).then((res) => res.json());
        cacheSubplebbits = multisub.subplebbits;
        setSubplebbits(multisub.subplebbits);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return cacheSubplebbits || subplebbits;
};

export const useDefaultSubplebbitAddresses = () => {
  const defaultSubplebbits = useDefaultSubplebbits();
  const { hideAdultCommunities, hideGoreCommunities, hideAntiCommunities, hideVulgarCommunities } = useContentOptionsStore();

  const filteredSubplebbits = useMemo(() => {
    return defaultSubplebbits.filter((subplebbit: Subplebbit) => {
      const tags = subplebbit.tags || [];
      if (hideAdultCommunities && tags.includes('adult')) return false;
      if (hideGoreCommunities && tags.includes('gore')) return false;
      if (hideAntiCommunities && tags.includes('anti')) return false;
      if (hideVulgarCommunities && tags.includes('vulgar')) return false;
      return true;
    });
  }, [defaultSubplebbits, hideAdultCommunities, hideGoreCommunities, hideAntiCommunities, hideVulgarCommunities]);

  return useMemo(() => filteredSubplebbits.map((subplebbit) => subplebbit.address), [filteredSubplebbits]);
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

export const useMultisubMetadata = () => {
  const [metadata, setMetadata] = useState<MultisubMetadata | null>(null);

  useEffect(() => {
    if (cacheMetadata) {
      return;
    }
    (async () => {
      try {
        const multisub = await fetch(
          'https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/multisub.json',
          // { cache: 'no-cache' }
        ).then((res) => res.json());
        const { title, description, createdAt, updatedAt } = multisub;
        const metadata: MultisubMetadata = { title, description, createdAt, updatedAt };
        cacheMetadata = metadata;
        setMetadata(metadata);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return cacheMetadata || metadata;
};

const getUniqueTags = (multisub: any) => {
  const allTags = new Set<string>();
  Object.values(multisub).forEach((sub: any) => {
    if (sub?.tags?.length) {
      sub.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  return Array.from(allTags).sort();
};

export const useDefaultSubplebbitTags = (subplebbits: any) => {
  return useMemo(() => getUniqueTags(subplebbits), [subplebbits]);
};
