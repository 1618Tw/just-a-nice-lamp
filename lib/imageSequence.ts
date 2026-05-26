'use client';
import { useEffect, useMemo, useRef } from 'react';

// Preload every frame of an image sequence into memory. The returned `urls`
// are stable for the lifetime of the component and can be assigned to
// <img src=> from a scroll loop. `imagesRef` holds the Image() objects so
// the browser keeps them warm in its decode cache.
export function useImageSequence(folder: string, count: number) {
  const urls = useMemo(() => {
    const out = new Array<string>(count);
    for (let i = 0; i < count; i++) {
      out[i] = `${folder}/${String(i).padStart(3, '0')}.jpg`;
    }
    return out;
  }, [folder, count]);

  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    if (typeof Image === 'undefined') return;
    const imgs: HTMLImageElement[] = new Array(urls.length);
    for (let i = 0; i < urls.length; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = urls[i];
      imgs[i] = img;
    }
    imagesRef.current = imgs;
    return () => {
      imagesRef.current = [];
    };
  }, [urls]);

  return { imagesRef, urls };
}

export function frameIndex(local: number, count: number): number {
  const idx = Math.floor(local * count);
  if (idx < 0) return 0;
  if (idx >= count) return count - 1;
  return idx;
}
