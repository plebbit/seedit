import { useEffect, useState } from 'react';
import localForageLru from '@plebbit/plebbit-react-hooks/dist/lib/localforage-lru/index.js';

const gifFrameDb = localForageLru.createInstance({ name: 'seeditGifFrames', size: 500 });

const getCachedGifFrame = async (url: string): Promise<string | null> => {
  return await gifFrameDb.getItem(url);
};

const setCachedGifFrame = async (url: string, frameUrl: string): Promise<void> => {
  await gifFrameDb.setItem(url, frameUrl);
};

export const fetchImage = (url: string): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onloadend = () => {
      if (request.response !== undefined && (request.status === 200 || request.status === 304)) {
        resolve(request.response);
      } else {
        reject(new Error(`XMLHttpRequest, ${request.statusText}`));
      }
    };
    request.send();
  });
};

export const readImage = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  });
};

const parseGif = async (buf: ArrayBuffer): Promise<Blob> => {
  const image = new Image();
  await new Promise((resolve) => {
    image.src = URL.createObjectURL(new Blob([buf]));
    image.onload = resolve;
  });
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('Canvas Context null');
  ctx.drawImage(image, 0, 0, image.width, image.height);
  return await new Promise((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (blob === null) {
        reject('Canvas Blob null');
      } else {
        resolve(blob);
      }
    }),
  );
};

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
        const cachedFrame = await getCachedGifFrame(url);
        if (cachedFrame) {
          if (isActive) setFrameUrl(cachedFrame);
          return;
        }

        const blob = typeof url === 'string' ? await parseGif(await fetchImage(url)) : await parseGif(await readImage(url as File));
        const objectUrl = URL.createObjectURL(blob);
        if (isActive) {
          setFrameUrl(objectUrl);
          await setCachedGifFrame(url, objectUrl);
        }
      } catch (error) {
        console.error('Failed to load GIF frame:', error);
        if (isActive) setFrameUrl(null);
      }
    };

    fetchFrame();

    return () => {
      isActive = false;
    };
  }, [url]);

  return frameUrl;
};

export default useFetchGifFirstFrame;
