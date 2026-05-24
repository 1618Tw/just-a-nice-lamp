'use client';
import { useEffect, useRef, useState } from 'react';

// Timeline (fractions of total scroll through the pinned section):
//   0.00 - 0.25  oval intro video scrubs
//   0.24 - 0.32  title fades in
//   0.31 - 0.42  oval out, lamp in
//   0.42 - 0.62  lamp decomposes (scrubs)
//   0.62         shapes video cuts in (instant) on top of lamp
//   0.62 - 0.95  shapes video scrubs
//   0.72 - 0.84  statement text fades in on the left
const SCRUB_END = 0.25;
const TEXT_START = 0.24;
const TEXT_END = 0.32;
const HERO_START = 0.31;
const HERO_END = 0.42;
const OVAL_FADE_START = 0.32;
const OVAL_FADE_END = 0.44;
const LAMP_SCRUB_END = 0.62;
const SHAPES_CUT = 0.62;
const SHAPES_SCRUB_END = 0.95;
const STATEMENT_START = 0.72;
const STATEMENT_END = 0.84;
const TITLE_FADE_OUT_START = 0.58;
const TITLE_FADE_OUT_END = 0.66;

const STATEMENT_TEXT =
  'I wanted to see how far flat lights can go. If we see them from another perspective, they could be invisible, feel very light, and at the same time the biggest presence in the room.';

const ramp = (p: number, start: number, end: number) =>
  Math.min(Math.max((p - start) / (end - start), 0), 1);

export function IntroAnimation() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lampVideoRef = useRef<HTMLVideoElement>(null);
  const shapesVideoRef = useRef<HTMLVideoElement>(null);
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
    const lamp = lampVideoRef.current;
    const shapes = shapesVideoRef.current;
    if (!v && !lamp && !shapes) return;
    v?.pause();
    lamp?.pause();
    shapes?.pause();
    const scrub = (el: HTMLVideoElement, local: number) => {
      if (!isFinite(el.duration) || el.duration <= 0) return;
      const target = local * el.duration;
      if (Math.abs(el.currentTime - target) > 1 / 60) {
        try {
          el.currentTime = target;
        } catch {
          /* video not ready */
        }
      }
    };
    const tick = () => {
      const p = progressRef.current;
      // Only scrub the video that is currently (or about to be) on screen.
      // The intro oval is the active layer until SCRUB_END; the lamp is active
      // from HERO_START through SHAPES_CUT; the shapes take over after that.
      if (v && p <= SCRUB_END + 0.02) {
        scrub(v, Math.min(p / SCRUB_END, 1));
      }
      if (lamp && p >= HERO_START - 0.02 && p < SHAPES_CUT + 0.02) {
        const local = Math.min(
          Math.max((p - HERO_END) / (LAMP_SCRUB_END - HERO_END), 0),
          1,
        );
        scrub(lamp, local);
      }
      if (shapes && p >= SHAPES_CUT - 0.02) {
        const local = Math.min(
          Math.max((p - LAMP_SCRUB_END) / (SHAPES_SCRUB_END - LAMP_SCRUB_END), 0),
          1,
        );
        scrub(shapes, local);
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion]);

  const textOpacity =
    ramp(progress, TEXT_START, TEXT_END) *
    (1 - ramp(progress, TITLE_FADE_OUT_START, TITLE_FADE_OUT_END));
  const heroOpacity = ramp(progress, HERO_START, HERO_END);
  const ovalOpacity = 1 - ramp(progress, OVAL_FADE_START, OVAL_FADE_END);
  const shapesOpacity = progress >= SHAPES_CUT ? 1 : 0;
  const statementOpacity = ramp(progress, STATEMENT_START, STATEMENT_END);
  const statementSlide = (1 - statementOpacity) * 80;
  const scrollHintOpacity = 1 - ramp(progress, 0.0, 0.04);

  return (
    <section id="intro" ref={sectionRef} className="relative h-[800vh] bg-black">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-[10px] uppercase tracking-[0.45em] text-ivory/70"
          style={{ opacity: scrollHintOpacity }}
        >
          Scroll to reveal
        </div>
        <video
          ref={lampVideoRef}
          src="/hero-lamp.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: heroOpacity, transform: 'scale(1.15)', transformOrigin: 'center' }}
        />

        <video
          ref={shapesVideoRef}
          src="/shapes.mp4"
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: shapesOpacity, transform: 'scale(1.15)', transformOrigin: 'center' }}
        />

        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center px-6 md:px-16"
          style={{ opacity: shapesOpacity }}
        >
          <p
            className="max-w-md text-ivory md:max-w-lg"
            style={{
              opacity: statementOpacity,
              transform: `translateX(-${statementSlide}px)`,
              fontFamily: 'var(--font-serif), Georgia, serif',
              fontSize: 'clamp(20px, 2.4vw, 34px)',
              lineHeight: 1.3,
              letterSpacing: '-0.005em',
            }}
          >
            {STATEMENT_TEXT}
          </p>
        </div>

        <div
          className="relative flex items-center justify-center"
          style={{ width: 'min(64vw, 620px)', aspectRatio: '16/11.5' }}
        >
          <video
            ref={videoRef}
            src="/intro.mp4"
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain"
            style={{ opacity: ovalOpacity, mixBlendMode: 'screen' }}
          />

          <h1
            className="pointer-events-none relative z-10 px-4 text-center"
            style={{
              opacity: textOpacity,
              color: `color-mix(in srgb, #F4EAD8 ${Math.round((1 - heroOpacity) * 100)}%, #1F1B16)`,
              fontSize: 'clamp(15px, 2.3vw, 30px)',
              letterSpacing: '0.18em',
              lineHeight: 1.2,
              fontFamily: 'monospace',
            }}
          >
            Just a Nice Lamp
          </h1>
        </div>
      </div>
    </section>
  );
}
