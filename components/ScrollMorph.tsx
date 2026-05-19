'use client';
import { useEffect, useRef } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export type MorphLayer =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string };

export interface ScrollMorphProps {
  layers: MorphLayer[];
  copy?: string;
  className?: string;
}

/** opacity for layer i given overall progress p across N layers. */
function layerOpacity(i: number, n: number, p: number): number {
  if (n <= 1) return 1;
  const center = i / (n - 1);
  const span = 1 / (n - 1);
  const distance = Math.abs(p - center);
  if (distance >= span) return 0;
  return 1 - distance / span;
}

export function ScrollMorph({ layers, copy, className }: ScrollMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    layers.forEach((layer, i) => {
      if (layer.type !== 'video') return;
      const v = videoRefs.current[i];
      if (!v || !isFinite(v.duration)) return;
      const o = layerOpacity(i, layers.length, progress);
      if (o > 0) {
        const local =
          layers.length === 1
            ? progress
            : (progress - i / (layers.length - 1)) * (layers.length - 1) + 0.5;
        const clamped = Math.max(0, Math.min(1, local));
        try {
          v.currentTime = clamped * v.duration;
        } catch {}
      }
    });
  }, [progress, layers]);

  return (
    <section ref={containerRef} className={className ?? 'relative h-[200vh]'}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {layers.map((layer, i) => {
          const opacity = layerOpacity(i, layers.length, progress);
          const style = { opacity, transition: 'opacity 80ms linear' as const };
          if (layer.type === 'image') {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={layer.src}
                alt={layer.alt ?? ''}
                className="absolute inset-0 h-full w-full object-cover"
                style={style}
              />
            );
          }
          return (
            <video
              key={i}
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              src={layer.src}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              style={style}
            />
          );
        })}
        {copy && (
          <p className="absolute bottom-10 left-6 right-6 md:left-10 md:right-auto md:max-w-md font-serif text-2xl md:text-3xl text-ivory">
            {copy}
          </p>
        )}
      </div>
    </section>
  );
}
