'use client';
import { useEffect, useRef, useState } from 'react';
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
  const progressRef = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  progressRef.current = progress;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    const tick = () => {
      if (!isFinite(v.duration) || v.duration <= 0) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const target = progressRef.current * v.duration;
      const diff = target - currentTime.current;
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
  }, [smoothing, reducedMotion]);

  return (
    <div ref={containerRef} className={className ?? 'relative h-[300vh] bg-ink'}>
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-ivory/70"
          style={{ opacity: Math.max(1 - progress * 6, 0) }}
        >
          scroll
        </div>
      </div>
    </div>
  );
}
