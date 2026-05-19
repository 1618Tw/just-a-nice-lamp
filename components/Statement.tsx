'use client';
import { useEffect, useRef, useState } from 'react';

export interface StatementProps {
  headline: string;
  sub?: string;
}

export function Statement({ headline, sub }: StatementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <h2
        className="font-serif text-ink transition-all duration-1000 ease-out"
        style={{
          fontSize: 'clamp(64px, 12vw, 180px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
          lineHeight: 1,
        }}
      >
        {headline}
      </h2>
      {sub && (
        <p
          className="mt-6 text-sm uppercase tracking-[0.25em] text-mute transition-opacity duration-1000 delay-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {sub}
        </p>
      )}
    </section>
  );
}
