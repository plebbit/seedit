import { useState, useEffect } from 'react';

interface Position {
  top: number;
  left: number;
}

export const useElementPosition = (ref: React.RefObject<HTMLElement>, enabled: boolean | undefined) => {
  const [position, setPosition] = useState<Position | null>(null);

  useEffect(() => {
    if (!ref.current || !enabled) {
      setPosition(null);
      return;
    }

    let rafId: number;
    let lastTop: number = 0;
    let lastLeft: number = 0;

    const updatePosition = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const newTop = window.scrollY + rect.top + rect.height / 2;
      const newLeft = rect.right + 5;

      // Only update state if position actually changed
      if (newTop !== lastTop || newLeft !== lastLeft) {
        lastTop = newTop;
        lastLeft = newLeft;
        setPosition({ top: newTop, left: newLeft });
      }

      rafId = requestAnimationFrame(updatePosition);
    };

    // Start the animation frame loop
    updatePosition();

    // Also watch for size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(ref.current);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  }, [ref, enabled]);

  return position;
};
