'use client';
import { useEffect, useRef, useState } from 'react';

const SCRUB_END = 0.85;
const TEXT_START = 0.15;
const TEXT_END = 0.55;

const ramp = (p: number, start: number, end: number) =>
  Math.min(Math.max((p - start) / (end - start), 0), 1);

export function ShapesScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame: number | null = null;

    const measure = () => {
      frame = null;
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / scrollable));
      progressRef.current = p;
      setProgress(p);
    };

    const onScroll = () => {
      if (frame != null) return;
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame != null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

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
        const local = Math.min(progressRef.current / SCRUB_END, 1);
        const target = local * v.duration;
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

  const textOpacity = ramp(progress, TEXT_START, TEXT_END);
  const textLift = (1 - textOpacity) * 16;

  return (
    <section ref={sectionRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src="/shapes.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="relative z-10 flex h-full items-center px-6 md:px-16">
          <div
            className="max-w-md md:max-w-lg text-ivory"
            style={{
              opacity: textOpacity,
              transform: `translateY(${textLift}px)`,
            }}
          >
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(22px, 2.6vw, 38px)',
                lineHeight: 1.25,
                letterSpacing: '-0.005em',
              }}
            >
              From one form, three. The lamp breaks into the shapes that
              defined it, light, frame, and the space between.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
