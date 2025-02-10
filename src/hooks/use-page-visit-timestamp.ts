import { useState } from 'react';

const cleanupOldTimestamps = () => {
  const currentTime = Math.floor(Date.now() / 1000);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('visit-timestamp-')) {
      const storedTime = parseInt(localStorage.getItem(key) || '0');
      if (currentTime - storedTime > 30 * 60) {
        localStorage.removeItem(key);
      }
    }
  }
};

export const usePageVisitTimestamp = (cid: string) => {
  const [pageVisitTimestamp] = useState(() => {
    const currentTime = Math.floor(Date.now() / 1000);

    cleanupOldTimestamps();

    const storedTimestamp = localStorage.getItem(`visit-timestamp-${cid}`);
    if (storedTimestamp) {
      const timestamp = parseInt(storedTimestamp);
      if (currentTime - timestamp > 30 * 60) {
        localStorage.setItem(`visit-timestamp-${cid}`, currentTime.toString());
        return currentTime;
      }
      return timestamp;
    }

    localStorage.setItem(`visit-timestamp-${cid}`, currentTime.toString());
    return currentTime;
  });

  return pageVisitTimestamp;
};
