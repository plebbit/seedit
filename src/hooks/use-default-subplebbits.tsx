import { useState, useEffect } from 'react';

const useDefaultSubplebbits = () => {
  const [value, setValue] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const value = await fetch('https://raw.githubusercontent.com/plebbit/temporary-default-subplebbits/master/subplebbits.json', { cache: 'no-cache' }).then((res) =>
          res.json(),
        );
        setValue(value);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return value;
};

export default useDefaultSubplebbits;
