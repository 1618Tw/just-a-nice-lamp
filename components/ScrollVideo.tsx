'use client';
import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export interface ScrollVideoProps {
  src: string;
  className?: string;
  /** Headline rendered as a centered overlay that fades in mid-scroll. */
  headline?: string;
  /** Small kicker text rendered above the headline. */
  kicker?: string;
}

function fade(progress: number, inAt: number, outAt: number, fadeRange = 0.08) {
  const inO = Math.min(Math.max((progress - inAt) / fadeRange, 0), 1);
  const outO = Math.min(Math.max((outAt - progress) / fadeRange, 0), 1);
  return inO * outO;
}

export function ScrollVideo({ src, className, headline, kicker }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(containerRef);
  const progressRef = useRef(0);
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
      if (isFinite(v.duration) && v.duration > 0) {
        const target = progressRef.current * v.duration;
        if (Math.abs(v.currentTime - target) > 1 / 60) {
          try {
            v.currentTime = target;
          } catch {
            /* video not ready */
          }
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion]);

  const headlineOpacity = fade(progress, 0.42, 0.88, 0.1);
  const kickerOpacity = fade(progress, 0.18, 0.92, 0.08);
  const cueOpacity = Math.max(1 - progress * 6, 0);

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
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/40" />

        {kicker && (
          <div
            className="pointer-events-none absolute left-1/2 top-[18%] -translate-x-1/2 text-[10px] uppercase tracking-[0.45em] text-ivory/80"
            style={{ opacity: kickerOpacity }}
          >
            {kicker}
          </div>
        )}

        {headline && (
          <h1
            className="pointer-events-none absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-6 text-center font-serif text-ivory"
            style={{
              opacity: headlineOpacity,
              fontSize: 'clamp(48px, 9vw, 132px)',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              textShadow: '0 2px 30px rgba(0,0,0,0.35)',
            }}
          >
            {headline}
          </h1>
        )}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.45em] text-ivory/70"
          style={{ opacity: cueOpacity }}
        >
          scroll
        </div>
      </div>
    </div>
  );
}
