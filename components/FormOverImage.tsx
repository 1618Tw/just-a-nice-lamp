'use client';
import { useRef } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';
import { PreorderForm } from './PreorderForm';

export function FormOverImage() {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(sectionRef);

  // Phase the section:
  //  0.00 - 0.35  sharp image visible, no card
  //  0.35 - 0.70  image blurs, card fades up
  //  0.70 - 1.00  full blur, card settled
  const ramp = Math.min(Math.max((progress - 0.35) / 0.35, 0), 1);
  const blur = ramp * 28;
  const overlayDarkness = 0.15 + ramp * 0.3;
  const cardOpacity = ramp;
  const cardLift = (1 - ramp) * 28;

  return (
    <section id="preorder" ref={sectionRef} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/lamp-room.png)',
            filter: `blur(${blur}px) saturate(0.95)`,
            transform: 'scale(1.06)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: `rgba(31,27,22,${overlayDarkness})` }}
        />

        <div
          className="pointer-events-none absolute left-6 top-10 text-[10px] uppercase tracking-[0.45em] text-ivory/80 md:left-16"
          style={{ opacity: 1 - ramp }}
        >
          Reserve — Edition 01
        </div>

        <div
          className="relative w-full max-w-md px-8 py-10 md:px-10 md:py-12"
          style={{
            opacity: cardOpacity,
            transform: `translateY(${cardLift}px)`,
            background: 'rgba(244, 234, 216, 0.97)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
            transition: 'opacity 80ms linear, transform 80ms linear',
          }}
        >
          <span className="block text-center text-[10px] uppercase tracking-[0.45em] text-mute">Pre-order</span>
          <h2 className="mt-3 text-center font-serif text-4xl md:text-5xl" style={{ letterSpacing: '-0.01em' }}>
            Reserve yours.
          </h2>
          <p className="mx-auto mt-3 mb-10 max-w-xs text-center text-xs leading-relaxed text-mute">
            Limited first run. No payment now &mdash; we&rsquo;ll email when shipping opens.
          </p>
          <PreorderForm />
        </div>
      </div>
    </section>
  );
}
