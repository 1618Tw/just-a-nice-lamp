'use client';
import { useEffect, useRef, useState } from 'react';

export function ImageHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen bg-ivory">
      <img
        src="/hero-lamp.jpg"
        alt="Just a Nice Lamp, disc-shaped ambient light"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ivory/30" />
      <div
        className="pointer-events-none absolute left-6 top-10 text-[10px] uppercase tracking-[0.45em] text-ink/70 md:left-16"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.2s ease 0.3s',
        }}
      >
        Edition 01, A new object
      </div>
    </section>
  );
}
