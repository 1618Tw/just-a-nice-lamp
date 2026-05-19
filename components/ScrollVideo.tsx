'use client';
import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export interface ScrollVideoProps {
  src: string;
  className?: string;
  smoothing?: number;
}

export function ScrollVideo({ src, className, smoothing = 0.15 }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(containerRef);
  const targetTime = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    targetTime.current = progress * v.duration;
  }, [progress]);

  useEffect(() => {
    if (reducedMotion) return;
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
        try { v.currentTime = currentTime.current; } catch {}
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current != null) cancelAnimationFrame(rafId.current); };
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
      </div>
    </div>
  );
}
