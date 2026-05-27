'use client';
import { useEffect, useRef, useState } from 'react';

// Intro splash for every viewport: plays the intro.mp4 oval once, then
// dissolves to reveal the hero lamp. The reason this exists is
// performance, not branding — while the oval is on screen we preload
// every JPG the page will scrub through AND force their decode, so by
// the time the user can scroll, every frame is a cached bitmap ready to
// paint with no flicker.

const DESKTOP_SEQUENCES: Array<{ folder: string; count: number }> = [
  { folder: '/frames/intro', count: 96 },
  { folder: '/frames/hero-lamp', count: 120 },
  { folder: '/frames/shapes', count: 120 },
  { folder: '/frames/closing', count: 180 },
];

const MOBILE_SEQUENCES: Array<{ folder: string; count: number }> = [
  { folder: '/frames/intro', count: 96 },
  { folder: '/frames/hero-lamp-mobile', count: 120 },
  { folder: '/frames/shapes-mobile', count: 120 },
  { folder: '/frames/closing', count: 180 },
];

const FADE_MS = 500;
// If autoplay is blocked and `ended` never fires, dismiss anyway.
const HARD_TIMEOUT_MS = 6000;
// Scroll progress within IntroAnimation where the hero lamp is fully
// revealed (matches HERO_END in IntroAnimation.tsx).
const LAMP_REVEAL_PROGRESS = 0.42;

function urlsFor(sequences: Array<{ folder: string; count: number }>) {
  return sequences.flatMap(({ folder, count }) =>
    Array.from({ length: count }, (_, i) => `${folder}/${String(i).padStart(3, '0')}.jpg`),
  );
}

export function IntroLoader() {
  const [mounted, setMounted] = useState(false);
  // null = viewport not measured yet — don't preload until we know which set
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pct, setPct] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  // Preload + decode every frame the page will scrub through. We don't
  // surface the load progress to the UI — the % shown to the user is
  // driven by the oval video's playback so it always advances smoothly.
  useEffect(() => {
    if (isMobile === null || hidden) return;
    const urls = urlsFor(isMobile ? MOBILE_SEQUENCES : DESKTOP_SEQUENCES);
    const imgs: HTMLImageElement[] = [];
    for (const url of urls) {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      img.decode?.().catch(() => {});
      imgs.push(img);
    }
    return () => {
      imgs.length = 0;
    };
  }, [isMobile, hidden]);

  // Drive the displayed % from the oval video's currentTime so it grows
  // from 0 to 100 over the duration of the splash animation.
  useEffect(() => {
    if (hidden) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      if (v && isFinite(v.duration) && v.duration > 0) {
        const p = Math.min(100, Math.round((v.currentTime / v.duration) * 100));
        setPct(p);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hidden]);

  // Park the page at the hero lamp before fading, so the dissolve lands
  // on the lamp instead of the very top of the IntroAnimation section.
  const beginExit = () => {
    if (fading) return;
    const section = document.getElementById('intro');
    if (section) {
      const scrollable = Math.max(0, section.offsetHeight - window.innerHeight);
      window.scrollTo(0, scrollable * LAMP_REVEAL_PROGRESS);
    }
    // Two rAFs: first lets the IntroAnimation scroll listener pick up the
    // new position and queue a measure, second lets React commit and paint
    // the lamp underneath before the overlay starts fading.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFading(true));
    });
  };

  useEffect(() => {
    if (isMobile === null || fading || hidden) return;
    const safety = window.setTimeout(beginExit, HARD_TIMEOUT_MS);
    return () => window.clearTimeout(safety);
    // beginExit closes over fading; intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, fading, hidden]);

  if (!mounted || hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      style={{
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: fading ? 'none' : 'auto',
      }}
      onTransitionEnd={() => {
        if (fading) setHidden(true);
      }}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        poster="/intro-poster.jpg"
        muted
        autoPlay
        playsInline
        preload="auto"
        aria-hidden="true"
        className="h-auto w-[80vw] max-w-[480px]"
        style={{ mixBlendMode: 'screen' }}
        onEnded={beginExit}
      />
      <span
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.45em] text-ivory/80"
        style={{ fontFamily: 'monospace' }}
      >
        loading {pct}%
      </span>
    </div>
  );
}
