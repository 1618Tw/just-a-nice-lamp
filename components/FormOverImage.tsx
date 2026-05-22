'use client';
import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';
import { PreorderForm } from './PreorderForm';

// Phase the section across its scroll travel:
//   0.00 - 0.65  scrub closing.mp4 from start to end
//   0.60 - 0.95  background blurs in
//   0.70 - 0.95  pre-order card fades up
const SCRUB_END = 0.65;
const BLUR_START = 0.6;
const BLUR_END = 0.78;
const CARD_START = 0.7;
const CARD_END = 0.82;

const ramp = (p: number, start: number, end: number) =>
  Math.min(Math.max((p - start) / (end - start), 0), 1);

export function FormOverImage() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(sectionRef);
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

  const blurRamp = ramp(progress, BLUR_START, BLUR_END);
  const blur = blurRamp * 28;
  const overlayDarkness = 0.18 + blurRamp * 0.3;
  const cardOpacity = ramp(progress, CARD_START, CARD_END);
  const cardLift = (1 - cardOpacity) * 28;

  return (
    <section id="preorder" ref={sectionRef} className="relative h-[350vh] bg-ink">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src="/closing.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: `blur(${blur}px) saturate(0.95)` }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `rgba(31,27,22,${overlayDarkness})` }}
        />

        <div
          className="pointer-events-none absolute left-6 top-10 text-[10px] uppercase tracking-[0.45em] text-ivory/80 md:left-16"
          style={{ opacity: 1 - cardOpacity }}
        >
          Reserve, Edition 01
        </div>

        <div
          className="relative w-full max-w-md px-8 py-10 md:px-10 md:py-12"
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardLift}px)`,
            background: 'rgba(244, 234, 216, 0.97)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
            transition: 'opacity 80ms linear, transform 80ms linear',
            pointerEvents: cardOpacity > 0.5 ? 'auto' : 'none',
          }}
        >
          <span className="block text-center text-[10px] uppercase tracking-[0.45em] text-mute">Pre-order</span>
          <h2
            className="mt-3 text-center font-serif text-4xl md:text-5xl"
            style={{ letterSpacing: '-0.01em' }}
          >
            Reserve yours.
          </h2>
          <p className="mx-auto mt-3 mb-10 max-w-xs text-center text-xs leading-relaxed text-mute">
            Limited first run. No payment now, we&rsquo;ll email when shipping opens.
          </p>
          <PreorderForm />
        </div>
      </div>
    </section>
  );
}
