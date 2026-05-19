'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ProgressInput {
  top: number;
  height: number;
  viewportHeight: number;
}

export function computeProgress({ top, height, viewportHeight }: ProgressInput): number {
  const travel = height + viewportHeight;
  if (travel <= 0) return 0;
  const traveled = viewportHeight - top;
  const p = traveled / travel;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return p;
}

export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => {
      frame.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setProgress(
        computeProgress({
          top: rect.top,
          height: rect.height,
          viewportHeight: window.innerHeight,
        })
      );
    };

    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);

  return progress;
}
