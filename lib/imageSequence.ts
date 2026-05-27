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

// Draw a single image into the canvas with object-cover or object-contain
// semantics, at the given globalAlpha. Safe to call with an Image that hasn't
// loaded yet — it just no-ops in that case.
function drawFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  fit: 'cover' | 'contain',
  alpha: number,
) {
  if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) return;
  const scale =
    fit === 'cover'
      ? Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      : Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}

// Crossfade-draw the right pair of frames into the canvas given a 0..1 local
// progress. Replaces the two-stacked-<img> approach: one draw of the floor
// frame at alpha 1 plus one draw of the ceil frame at the fractional alpha
// is significantly cheaper to composite on weaker GPUs than two layered
// <img> elements with continuously animated opacity.
export function drawSequenceFrame(
  canvas: HTMLCanvasElement | null,
  images: HTMLImageElement[],
  local: number,
  fit: 'cover' | 'contain',
) {
  if (!canvas) return;
  const count = images.length;
  if (count === 0) return;

  // Match the canvas drawing buffer to its CSS size at devicePixelRatio.
  const dpr = window.devicePixelRatio || 1;
  const targetW = Math.round(canvas.clientWidth * dpr);
  const targetH = Math.round(canvas.clientHeight * dpr);
  if (targetW === 0 || targetH === 0) return;
  if (canvas.width !== targetW) canvas.width = targetW;
  if (canvas.height !== targetH) canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const fIdx = Math.min(Math.max(local * (count - 1), 0), count - 1);
  const lower = Math.floor(fIdx);
  const upper = Math.min(count - 1, lower + 1);
  const alpha = fIdx - lower;

  ctx.clearRect(0, 0, targetW, targetH);
  drawFit(ctx, images[lower], targetW, targetH, fit, 1);
  if (alpha > 0 && upper !== lower) {
    drawFit(ctx, images[upper], targetW, targetH, fit, alpha);
  }
}
