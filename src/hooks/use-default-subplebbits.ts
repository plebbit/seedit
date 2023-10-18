import { useState, useEffect, useMemo } from 'react';

interface Subplebbit {
  address: string;
}

const useDefaultSubplebbits = () => {
  const [subplebbits, setSubplebbits] = useState<Subplebbit[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const fetchedSubplebbits: Subplebbit[] = await fetch('https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/subplebbits.json', {
          cache: 'no-cache',
        }).then((res) => res.json());

        setSubplebbits(fetchedSubplebbits);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const addresses = useMemo(() => subplebbits.map((subplebbit) => subplebbit.address), [subplebbits]);

  return addresses;
};

export default useDefaultSubplebbits;
