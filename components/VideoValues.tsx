'use client';
import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';
import { drawSequenceFrame, useImageSequence } from '@/lib/imageSequence';
import { PreorderForm } from './PreorderForm';

const CLOSING_FRAMES = 180;

const VALUES = [
  { num: '01', title: 'Built in Europe', desc: 'Designed and assembled in Italy, using local supply chains and small-batch manufacturing to ensure quality at every step.' },
  { num: '02', title: 'Fully recycled materials', desc: 'Every component is sourced from post-consumer recycled materials, from the aluminium frame to the packaging it ships in.' },
  { num: '03', title: 'A perfect design', desc: 'No excess, no compromise. Each curve and proportion is resolved so nothing needs to be added or taken away.' },
];

const SCRUB_END = 0.85;
const COL_WINDOWS: Array<[number, number]> = [
  [0.22, 0.31],
  [0.29, 0.38],
  [0.36, 0.45],
];
const FORM_START = 0.55;
const FORM_END = 0.70;

const ramp = (p: number, start: number, end: number) =>
  Math.min(Math.max((p - start) / (end - start), 0), 1);

export function VideoValues() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progress = useScrollProgress(sectionRef);
  const progressRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const closing = useImageSequence('/frames/closing', CLOSING_FRAMES);

  progressRef.current = progress;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const tick = () => {
      const local = Math.min(progressRef.current / SCRUB_END, 1);
      drawSequenceFrame(canvasRef.current, closing.imagesRef.current, local, 'cover');
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion, closing.imagesRef]);

  const overlayDarkness = 0.1 + ramp(progress, 0.22, 0.45) * 0.45;
  const formProgress = ramp(progress, FORM_START, FORM_END);
  const formLift = (1 - formProgress) * 50;

  return (
    <section ref={sectionRef} className="relative h-[250vh] bg-ink md:h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `rgba(31,27,22,${overlayDarkness})` }}
        />

        <div
          className="absolute inset-0 flex items-start justify-center px-6 pt-4 md:px-16 md:pt-14"
        >
          <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {VALUES.map(({ num, title, desc }, i) => {
              const [start, end] = COL_WINDOWS[i];
              const colProgress = ramp(progress, start, end);
              // On mobile the values and the preorder form occupy the same
              // vertical space; fade the values out as the form comes up.
              const opacity = isMobile ? colProgress * (1 - formProgress) : colProgress;
              return (
                <div
                  key={num}
                  className="text-ivory"
                  style={{
                    opacity,
                    transform: `translateY(${(1 - colProgress) * 60}vh)`,
                  }}
                >
                  <span className="block text-sm uppercase tracking-[0.3em] text-ivory">
                    {num}
                  </span>
                  <span
                    className="mt-2 block leading-tight"
                    style={{ fontSize: 'clamp(24px, 3.5vw, 48px)' }}
                  >
                    {title}
                  </span>
                  <p className="mt-4 text-sm leading-relaxed text-ivory">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          id="preorder"
          className="absolute inset-x-0 bottom-10 flex justify-center px-6 md:bottom-16 md:px-16"
          style={{
            opacity: formProgress,
            transform: `translateY(${formLift}vh)`,
            pointerEvents: formProgress > 0.5 ? 'auto' : 'none',
          }}
        >
          <div
            className="grid w-full max-w-5xl gap-6 px-8 py-6 md:grid-cols-[1fr_2fr] md:items-center md:gap-10 md:px-10 md:py-8"
            style={{
              background: 'rgba(244, 234, 216, 0.97)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
            }}
          >
            <div>
              <span className="block text-[10px] uppercase tracking-[0.45em] text-mute">
                Pre-order
              </span>
              <h2
                className="mt-2 font-serif text-3xl md:text-4xl"
                style={{ letterSpacing: '-0.01em' }}
              >
                Reserve yours.
              </h2>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-mute">
                Limited first run. No payment now, we&rsquo;ll email when shipping opens.
              </p>
            </div>
            <PreorderForm layout="horizontal" />
          </div>
        </div>
      </div>
    </section>
  );
}
