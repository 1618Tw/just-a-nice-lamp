'use client';
import { useEffect, useState } from 'react';

// Show nav items only while the lamp image is on screen (between full lamp reveal and the shapes cut).
const LAMP_VISIBLE_START = 0.42;
const LAMP_VISIBLE_END = 0.62;

export function Nav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame: number | null = null;
    const measure = () => {
      frame = null;
      const section = document.getElementById('intro');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.max(0, Math.min(1, -rect.top / scrollable));
      setVisible(p >= LAMP_VISIBLE_START && p < LAMP_VISIBLE_END);
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

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10"
      style={{
        mixBlendMode: 'difference',
        color: '#F4EAD8',
        opacity: visible ? 1 : 0,
        transition: 'opacity 280ms ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <span className="font-serif text-xl tracking-tight">jnl</span>
      <a href="#preorder" className="text-sm uppercase tracking-[0.2em]">
        reserve
      </a>
    </nav>
  );
}
