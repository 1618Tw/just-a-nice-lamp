'use client';
import { useEffect, useRef, useState } from 'react';
import { drawSequenceFrame, useImageSequence } from '@/lib/imageSequence';

// Timeline (fractions of total scroll through the pinned section):
//   0.00 - 0.25  oval intro frames scrub
//   0.24 - 0.32  title fades in
//   0.31 - 0.42  oval out, lamp in
//   0.42 - 0.62  lamp decomposes (scrubs)
//   0.62         shapes cut in (instant) on top of lamp
//   0.62 - 0.95  shapes scrub
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

const INTRO_FRAMES = 96;
const LAMP_FRAMES = 120;
const SHAPES_FRAMES = 120;

const STATEMENT_TEXT =
  'I wanted to see how far flat lights can go. If we see them from another perspective, they could be invisible, feel very light, and at the same time the biggest presence in the room.';

const ramp = (p: number, start: number, end: number) =>
  Math.min(Math.max((p - start) / (end - start), 0), 1);

export function IntroAnimation() {
  const sectionRef = useRef<HTMLElement>(null);
  const introCanvas = useRef<HTMLCanvasElement>(null);
  const lampCanvas = useRef<HTMLCanvasElement>(null);
  const shapesCanvas = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use the vertical-format sources on phones so the lamp and shapes
  // aren't cropped to a narrow vertical slice of a landscape frame.
  const lampFolder = isMobile ? '/frames/hero-lamp-mobile' : '/frames/hero-lamp';
  const shapesFolder = isMobile ? '/frames/shapes-mobile' : '/frames/shapes';

  const intro = useImageSequence('/frames/intro', INTRO_FRAMES);
  const lamp = useImageSequence(lampFolder, LAMP_FRAMES);
  const shapes = useImageSequence(shapesFolder, SHAPES_FRAMES);

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
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const tick = () => {
      const p = progressRef.current;

      // Intro oval: always drive so it fades out cleanly via canvas opacity.
      {
        const local = Math.min(Math.max(p / SCRUB_END, 0), 1);
        const ovalOpacity = 1 - Math.min(
          Math.max((p - OVAL_FADE_START) / (OVAL_FADE_END - OVAL_FADE_START), 0),
          1,
        );
        const c = introCanvas.current;
        if (c) c.style.opacity = String(ovalOpacity);
        drawSequenceFrame(c, intro.imagesRef.current, local, 'contain');
      }

      if (p >= HERO_START - 0.02 && p < SHAPES_CUT + 0.02) {
        const local = Math.min(
          Math.max((p - HERO_END) / (LAMP_SCRUB_END - HERO_END), 0),
          1,
        );
        drawSequenceFrame(lampCanvas.current, lamp.imagesRef.current, local, 'cover');
      }
      if (p >= SHAPES_CUT - 0.02) {
        const local = Math.min(
          Math.max((p - LAMP_SCRUB_END) / (SHAPES_SCRUB_END - LAMP_SCRUB_END), 0),
          1,
        );
        drawSequenceFrame(shapesCanvas.current, shapes.imagesRef.current, local, 'cover');
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [reducedMotion, intro.imagesRef, lamp.imagesRef, shapes.imagesRef]);

  const textOpacity =
    ramp(progress, TEXT_START, TEXT_END) *
    (1 - ramp(progress, TITLE_FADE_OUT_START, TITLE_FADE_OUT_END));
  const heroOpacity = ramp(progress, HERO_START, HERO_END);
  const shapesOpacity = progress >= SHAPES_CUT ? 1 : 0;
  const statementOpacity = ramp(progress, STATEMENT_START, STATEMENT_END);
  const statementSlide = (1 - statementOpacity) * 80;
  const scrollHintOpacity = 1 - ramp(progress, 0.0, 0.04);

  return (
    <section id="intro" ref={sectionRef} className="relative h-[450vh] bg-black md:h-[800vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2 text-[10px] uppercase tracking-[0.45em] text-ivory/70"
          style={{ opacity: scrollHintOpacity }}
        >
          Scroll to reveal
        </div>

        <div
          className="absolute inset-0"
          style={{ opacity: heroOpacity, transform: 'scale(1.15)', transformOrigin: 'center' }}
        >
          <canvas
            ref={lampCanvas}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div
          className="absolute inset-0"
          style={{ opacity: shapesOpacity, transform: 'scale(1.15)', transformOrigin: 'center' }}
        >
          <canvas
            ref={shapesCanvas}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-start px-6 pt-[14vh] md:items-center md:px-16 md:pt-0"
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
          <canvas
            ref={introCanvas}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            style={{ mixBlendMode: 'screen' }}
          />

          <h1
            className="pointer-events-none relative z-10 -translate-y-[2vh] px-4 text-center md:translate-y-0"
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
