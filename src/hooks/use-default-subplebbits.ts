import { useState, useEffect } from 'react';

interface Subplebbit {
  title?: string;
  address: string;
  tags?: string[];
  features?: string[];
}

let cache: Subplebbit[] | null = null;

const useDefaultSubplebbits = () => {
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

export default useDefaultSubplebbits;
