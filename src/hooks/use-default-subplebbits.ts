import { useState, useEffect } from 'react';

interface Subplebbit {
  address: string;
}

const useDefaultSubplebbits = () => {
  const [subplebbitAddresses, setSubplebbitAddresses] = useState<string[]>([]);

  useEffect(() => {
    if (subplebbitAddresses.length > 0) {
      return;
    }

    (async () => {
      try {
        const fetchedSubplebbits: Subplebbit[] = await fetch('https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/subplebbits.json', {
          cache: 'no-cache',
        }).then((res) => res.json());

        const addresses = fetchedSubplebbits.map((subplebbit) => subplebbit.address);
        setSubplebbitAddresses(addresses);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [subplebbitAddresses]);

  return subplebbitAddresses;
};

export default useDefaultSubplebbits;
