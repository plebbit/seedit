import { useEffect, useState } from 'react';
import gifff from 'gifff/canvas';

const useFetchGifFirstFrame = (url: string | undefined) => {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setFrameUrl(null);
      return;
    }

    let isActive = true;

    const fetchFrame = async () => {
      try {
        const blob = await gifff(url);
        const objectUrl = URL.createObjectURL(blob);
        if (isActive) setFrameUrl(objectUrl);
      } catch (error) {
        console.error('Failed to load GIF frame:', error);
        if (isActive) setFrameUrl(null);
      }
    };

    fetchFrame();

    // Cleanup function to avoid setting state on unmounted component
    return () => {
      isActive = false;
    };
  }, [url]);

  return frameUrl;
};

export default useFetchGifFirstFrame;
