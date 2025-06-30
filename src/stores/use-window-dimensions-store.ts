import { create } from 'zustand';

interface WindowDimensionsState {
  width: number;
  height: number;
  isMobile: boolean;
  updateDimensions: () => void;
}

const useWindowDimensionsStore = create<WindowDimensionsState>((set, get) => {
  let isListenerAttached = false;

  const handleResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newIsMobile = newWidth < 640;

    const currentState = get();

    // Only update if dimensions changed significantly or mobile state changed
    const widthThreshold = 5; // 5px threshold
    const shouldUpdate =
      Math.abs(newWidth - currentState.width) > widthThreshold || Math.abs(newHeight - currentState.height) > widthThreshold || newIsMobile !== currentState.isMobile;

    if (shouldUpdate) {
      set({
        width: newWidth,
        height: newHeight,
        isMobile: newIsMobile,
      });
    }
  };

  const attachListener = () => {
    if (!isListenerAttached && typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      isListenerAttached = true;
    }
  };

  // Initialize with current window dimensions
  const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const initialIsMobile = initialWidth < 640;

  // Attach listener on first access
  if (typeof window !== 'undefined') {
    attachListener();
  }

  return {
    width: initialWidth,
    height: initialHeight,
    isMobile: initialIsMobile,
    updateDimensions: () => {
      attachListener();
      handleResize();
    },
  };
});

export default useWindowDimensionsStore;
