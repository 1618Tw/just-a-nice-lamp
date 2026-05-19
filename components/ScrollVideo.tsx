'use client';
import { useEffect, useRef } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export interface ScrollVideoProps {
  src: string;
  className?: string;
  /** lerp factor 0..1, lower = smoother but laggier. Default 0.15. */
  smoothing?: number;
}

export function ScrollVideo({ src, className, smoothing = 0.15 }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(containerRef);
  const targetTime = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef<number | null>(null);

  // Set target whenever scroll progress changes.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    targetTime.current = progress * v.duration;
  }, [progress]);

  // Lerp currentTime toward target each frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    const tick = () => {
      if (!isFinite(v.duration)) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const diff = targetTime.current - currentTime.current;
      if (Math.abs(diff) > 0.001) {
        currentTime.current += diff * smoothing;
        try {
          v.currentTime = currentTime.current;
        } catch {
          /* video not ready */
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [smoothing]);

  return (
    <div ref={containerRef} className={className ?? 'relative h-[300vh] md:h-[300vh] bg-ink'}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
