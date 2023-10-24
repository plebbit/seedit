import { useState, useEffect } from 'react';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const currentIsMobile = window.innerWidth < 768;
      setIsMobile((prevIsMobile) => {
        if (currentIsMobile !== prevIsMobile) {
          return currentIsMobile;
        }
        return prevIsMobile;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
