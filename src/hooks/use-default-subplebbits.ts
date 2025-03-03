import { useEffect, useMemo, useState } from 'react';
import { Subplebbit } from '@plebbit/plebbit-react-hooks';
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
  seeditAutoSubscribe?: boolean;
  lowUptime?: boolean;
}

let cacheSubplebbits: MultisubSubplebbit[] | null = null;
let cacheMetadata: MultisubMetadata | null = null;
let cacheAutoSubscribeAddresses: string[] | null = null;

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

        const filteredSubplebbits = multisub.subplebbits.filter((sub: MultisubSubplebbit) => !sub.lowUptime);

        cacheSubplebbits = filteredSubplebbits;

        // Cache auto-subscribe addresses when we fetch subplebbits
        cacheAutoSubscribeAddresses = filteredSubplebbits
          .filter((sub: MultisubSubplebbit) => sub.seeditAutoSubscribe && sub.address)
          .map((sub: MultisubSubplebbit) => sub.address);

        setSubplebbits(filteredSubplebbits);
      } catch (e) {
        console.warn(e);
      }
    })();
  }, []);

  return cacheSubplebbits || subplebbits;
};

export const getAutoSubscribeAddresses = () => cacheAutoSubscribeAddresses || [];

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
