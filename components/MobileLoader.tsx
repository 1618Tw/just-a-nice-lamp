'use client';
import { useEffect, useState } from 'react';

// Mobile-only splash: plays the intro.mp4 oval once, dissolves to reveal
// the hero lamp. The reason this exists is performance, not branding —
// during the ~3.6 s the oval is on screen we preload every JPG the page
// will scrub through AND force their decode, so by the time the user can
// scroll, every frame is a cached bitmap ready to paint with no flicker.

const SEQUENCES: Array<{ folder: string; count: number }> = [
  { folder: '/frames/intro', count: 48 },
  { folder: '/frames/hero-lamp-mobile', count: 60 },
  { folder: '/frames/shapes-mobile', count: 60 },
  { folder: '/frames/closing', count: 90 },
];

const ALL_FRAME_URLS: string[] = SEQUENCES.flatMap(({ folder, count }) =>
  Array.from({ length: count }, (_, i) => `${folder}/${String(i).padStart(3, '0')}.jpg`),
);

const FADE_MS = 500;
// If autoplay is blocked (Low Power Mode etc.) and `ended` never fires,
// dismiss anyway.
const HARD_TIMEOUT_MS = 6000;
// Scroll progress within IntroAnimation where the hero lamp is fully
// revealed (matches HERO_END in IntroAnimation.tsx).
const LAMP_REVEAL_PROGRESS = 0.42;

export function MobileLoader() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  // Preload + decode every frame the page will scrub through.
  useEffect(() => {
    if (!isMobile || hidden) return;
    const imgs: HTMLImageElement[] = [];
    for (const url of ALL_FRAME_URLS) {
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
    if (!isMobile || fading || hidden) return;
    const safety = window.setTimeout(beginExit, HARD_TIMEOUT_MS);
    return () => window.clearTimeout(safety);
    // beginExit is stable enough for this use; intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, fading, hidden]);

  if (!mounted || !isMobile || hidden) return null;

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
    </div>
  );
}
