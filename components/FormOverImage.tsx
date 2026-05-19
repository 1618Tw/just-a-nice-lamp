'use client';
import { useRef } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';
import { PreorderForm } from './PreorderForm';

export function FormOverImage() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);

  // Blur ramps as the user scrolls through the section.
  const blur = Math.min(progress * 24, 24);
  // Card fades in after the image has started blurring.
  const cardOpacity = Math.min(Math.max((progress - 0.15) / 0.35, 0), 1);

  return (
    <section id="preorder" ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/lamp-room.png)',
            filter: `blur(${blur}px) saturate(0.95)`,
            transform: 'scale(1.08)',
          }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-ink/35" />
        <div
          className="relative w-full max-w-md rounded-sm bg-ivory/95 px-8 py-10 shadow-2xl backdrop-blur md:px-10 md:py-12"
          style={{
            opacity: cardOpacity,
            transform: `translateY(${(1 - cardOpacity) * 24}px)`,
            transition: 'opacity 80ms linear, transform 80ms linear',
          }}
        >
          <h2 className="font-serif text-4xl md:text-5xl text-center">Reserve yours.</h2>
          <p className="mx-auto mt-3 mb-10 max-w-xs text-center text-xs uppercase tracking-[0.25em] text-mute">
            Limited first run. No payment now &mdash; we&rsquo;ll email when shipping opens.
          </p>
          <PreorderForm />
        </div>
      </div>
    </section>
  );
}
