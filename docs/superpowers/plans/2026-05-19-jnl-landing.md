# Just a Nice Lamp — Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page Next.js landing site for *Just a Nice Lamp* with a scroll-scrubbed hero video, a mid-page statement, a swappable scroll-driven dual-media section, and a pre-order form that writes to Google Sheets.

**Architecture:** Next.js 16 App Router + Tailwind v4 + TypeScript. Two pure modules carry the interesting logic: `lib/scrollProgress.ts` (math + DOM observation) and `app/api/preorder/route.ts` (validation + webhook proxy). Both are unit-tested with Vitest. Visual components consume the hook and are verified manually in a browser. The form posts JSON to a Next.js API route, which forwards to a Google Apps Script Web App that appends a row to a Sheet.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Vitest 2, Google Apps Script (Web App).

**Spec:** `docs/superpowers/specs/2026-05-19-jnl-landing-design.md`

---

## Task 0: Working state before starting

The repo currently contains:
```
/Users/paololancellotti/lampadaofficial/
├── Brand_Identity_In_a_modern_graphic_design_style_the_brand_9NRmAoQJ.png
├── Brand_Identity_In_a_realistic_style_a_dog_rests_on_a_rug_in_a_lCStME6w.png
├── Social_Media_Video_Ads_A_lone_man_walks_through_a_sparsely_populated_XybzC1bU.mp4
├── Social_Media_Video_Ads_A_person_with_dark_hair_and_a_light_complexion_IyrHEMHY.mp4
└── docs/superpowers/specs/2026-05-19-jnl-landing-design.md
```
Git is initialized; the spec is already committed. No Node project yet.

---

## Task 1: Scaffold Next.js project in place

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`, `next-env.d.ts`

- [ ] **Step 1: Initialize a Next.js 16 + TS + Tailwind project into the existing directory.**

Run from `/Users/paololancellotti/lampadaofficial/`:
```bash
npx --yes create-next-app@16 . \
  --typescript --tailwind --app --eslint \
  --src-dir=false --import-alias='@/*' \
  --no-turbopack --use-npm \
  --skip-install
```

If `create-next-app` refuses because the directory is non-empty, accept the prompt that asks to proceed (the brand asset files and `docs/` are safe — Next.js will not overwrite them).

- [ ] **Step 2: Install dependencies.**

```bash
npm install
```

- [ ] **Step 3: Verify dev server boots.**

```bash
npm run dev
```
Expected: server starts on http://localhost:3000 and the default Next.js page renders. Stop it with Ctrl-C.

- [ ] **Step 4: Add Vitest for the testable modules.**

```bash
npm install -D vitest @vitest/coverage-v8 @testing-library/dom jsdom
```

Add to `package.json` `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Create `vitest.config.ts`.**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
  },
});
```

- [ ] **Step 6: Verify `npm test` runs (no tests yet → passes).**

```bash
npm test
```
Expected: `No test files found, exiting with code 0` or equivalent success.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 + Tailwind v4 + Vitest"
```

---

## Task 2: Brand tokens, fonts, base layout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `app/page.tsx` (replace boilerplate)

- [ ] **Step 1: Replace `app/layout.tsx` with brand fonts and metadata.**

```tsx
import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Just a Nice Lamp',
  description: 'A perfect form. Warmth redefined.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="bg-ivory text-ink antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Replace `app/globals.css` with palette tokens and font wiring.**

```css
@import "tailwindcss";

@theme {
  --color-ivory: #F4EAD8;
  --color-coral: #C04A2D;
  --color-ink: #1F1B16;
  --color-mute: #A89E8E;
  --font-sans: var(--font-sans);
  --font-serif: var(--font-serif);
}

html, body { background: var(--color-ivory); color: var(--color-ink); }
* { -webkit-font-smoothing: antialiased; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Replace `app/page.tsx` with a minimal stub.**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="font-serif text-6xl p-10">Just a Nice Lamp</h1>
    </main>
  );
}
```

- [ ] **Step 4: Verify in browser.**

```bash
npm run dev
```
Open http://localhost:3000. Expected: ivory background, charcoal serif heading. Stop server.

- [ ] **Step 5: Commit.**

```bash
git add app/layout.tsx app/globals.css app/page.tsx
git commit -m "feat: brand palette, fonts, base layout"
```

---

## Task 3: Move media into `public/`

**Files:**
- Move: 2 mp4s + 1 png from repo root into `public/` with clean names

- [ ] **Step 1: Move and rename.**

```bash
mv "Social_Media_Video_Ads_A_person_with_dark_hair_and_a_light_complexion_IyrHEMHY.mp4" public/hero.mp4
mv "Social_Media_Video_Ads_A_lone_man_walks_through_a_sparsely_populated_XybzC1bU.mp4" public/detail.mp4
mv "Brand_Identity_In_a_realistic_style_a_dog_rests_on_a_rug_in_a_lCStME6w.png" public/lamp-room.png
```

- [ ] **Step 2: Keep the brand-board PNG out of `public/` (it's a reference, not an asset).** Move it to `docs/`.

```bash
mv "Brand_Identity_In_a_modern_graphic_design_style_the_brand_9NRmAoQJ.png" docs/brand-board.png
```

- [ ] **Step 3: Commit.**

```bash
git add -A
git commit -m "chore: move media assets into public/"
```

---

## Task 4: `lib/scrollProgress.ts` — pure math + hook (TDD)

**Files:**
- Create: `lib/scrollProgress.ts`
- Create: `lib/scrollProgress.test.ts`

The hook returns a number 0..1 describing how far an element has traveled across the viewport. The progress math is a pure function and is tested directly.

- [ ] **Step 1: Write failing test for `computeProgress`.**

`lib/scrollProgress.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { computeProgress } from './scrollProgress';

describe('computeProgress', () => {
  // element top is measured relative to viewport top.
  // progress = 0 when elementTop >= viewportHeight (not yet entered from below)
  // progress = 1 when elementTop + elementHeight <= 0 (fully scrolled past)
  // linear in between.
  const vh = 800;

  it('returns 0 when element is below the viewport', () => {
    expect(computeProgress({ top: 1000, height: 600, viewportHeight: vh })).toBe(0);
  });

  it('returns 1 when element is fully above the viewport', () => {
    expect(computeProgress({ top: -700, height: 600, viewportHeight: vh })).toBe(1);
  });

  it('returns 0.5 when element is halfway through its travel', () => {
    // travelDistance = height + viewportHeight = 1400
    // halfway: top = viewportHeight - travelDistance/2 = 800 - 700 = 100
    expect(computeProgress({ top: 100, height: 600, viewportHeight: vh })).toBeCloseTo(0.5, 5);
  });

  it('clamps to [0,1]', () => {
    expect(computeProgress({ top: 99999, height: 600, viewportHeight: vh })).toBe(0);
    expect(computeProgress({ top: -99999, height: 600, viewportHeight: vh })).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test — expect failure.**

```bash
npm test
```
Expected: fails because `computeProgress` is not exported yet.

- [ ] **Step 3: Implement `computeProgress` + `useScrollProgress`.**

`lib/scrollProgress.ts`:
```ts
'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ProgressInput {
  top: number;
  height: number;
  viewportHeight: number;
}

export function computeProgress({ top, height, viewportHeight }: ProgressInput): number {
  const travel = height + viewportHeight;
  if (travel <= 0) return 0;
  const traveled = viewportHeight - top;
  const p = traveled / travel;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return p;
}

export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const measure = () => {
      frame.current = null;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setProgress(
        computeProgress({
          top: rect.top,
          height: rect.height,
          viewportHeight: window.innerHeight,
        })
      );
    };

    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref]);

  return progress;
}
```

- [ ] **Step 4: Run tests — expect pass.**

```bash
npm test
```
Expected: 4 passed.

- [ ] **Step 5: Commit.**

```bash
git add lib/scrollProgress.ts lib/scrollProgress.test.ts vitest.config.ts
git commit -m "feat(lib): scrollProgress math + useScrollProgress hook"
```

---

## Task 5: `components/ScrollVideo.tsx` — scroll-scrubbed video

**Files:**
- Create: `components/ScrollVideo.tsx`

There is no unit test for this component — it is a thin wrapper over `useScrollProgress` plus DOM video calls. It is verified in the browser at Task 7.

- [ ] **Step 1: Implement.**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export interface ScrollVideoProps {
  src: string;
  className?: string;
  /** lerp factor 0..1, lower = smoother but laggier. Default 0.15. */
  smoothing?: number;
}

export function ScrollVideo({ src, className, smoothing = 0.15 }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(containerRef);
  const targetTime = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef<number | null>(null);

  // Set target whenever scroll progress changes.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    targetTime.current = progress * v.duration;
  }, [progress]);

  // Lerp currentTime toward target each frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    const tick = () => {
      if (!isFinite(v.duration)) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const diff = targetTime.current - currentTime.current;
      if (Math.abs(diff) > 0.001) {
        currentTime.current += diff * smoothing;
        try {
          v.currentTime = currentTime.current;
        } catch {
          /* video not ready */
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, [smoothing]);

  return (
    <div ref={containerRef} className={className ?? 'relative h-[300vh] md:h-[300vh] bg-ink'}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit.**

```bash
git add components/ScrollVideo.tsx
git commit -m "feat(components): ScrollVideo with scroll-scrubbed playback"
```

---

## Task 6: `components/Nav.tsx` — fixed top mark + reserve link

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Implement.**

```tsx
export function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10"
      style={{ mixBlendMode: 'difference', color: '#F4EAD8' }}
    >
      <span className="font-serif text-xl tracking-tight">jnl</span>
      <a href="#preorder" className="text-sm uppercase tracking-[0.2em]">
        reserve
      </a>
    </nav>
  );
}
```

- [ ] **Step 2: Wire into `app/layout.tsx`.** Add inside `<body>` above `{children}`:

```tsx
import { Nav } from '@/components/Nav';
// ...
<body className="bg-ivory text-ink antialiased">
  <Nav />
  {children}
</body>
```

- [ ] **Step 3: Commit.**

```bash
git add components/Nav.tsx app/layout.tsx
git commit -m "feat(components): fixed Nav with blend-mode color switching"
```

---

## Task 7: Hero in the page — first browser checkpoint

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with the hero only.**

```tsx
import { ScrollVideo } from '@/components/ScrollVideo';

export default function Home() {
  return (
    <main>
      <ScrollVideo src="/hero.mp4" />
    </main>
  );
}
```

- [ ] **Step 2: Browser check.**

```bash
npm run dev
```
Open http://localhost:3000. Scroll the page. Expected: the video advances in step with scrolling — slow, smooth. The page is ~300vh tall. The `jnl` mark and `reserve` link are visible at top in inverted color.

If scrubbing stutters on iOS Safari (test only if convenient), re-encode the MP4 with keyframes per frame:
```bash
ffmpeg -i public/hero.mp4 -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 -movflags +faststart -an public/hero.scrub.mp4
mv public/hero.scrub.mp4 public/hero.mp4
```

- [ ] **Step 3: Commit.**

```bash
git add app/page.tsx
git commit -m "feat(page): wire hero ScrollVideo"
```

---

## Task 8: `components/Statement.tsx` — "A perfect form."

**Files:**
- Create: `components/Statement.tsx`

- [ ] **Step 1: Implement with IntersectionObserver fade-in.**

```tsx
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
```

- [ ] **Step 2: Wire into `app/page.tsx`.**

```tsx
import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';

export default function Home() {
  return (
    <main>
      <ScrollVideo src="/hero.mp4" />
      <Statement headline="A perfect form." sub="Nothing added. Nothing extra." />
    </main>
  );
}
```

- [ ] **Step 3: Browser check.**

`npm run dev` → scroll past the hero → expected: headline fades+rises in. Stop server.

- [ ] **Step 4: Commit.**

```bash
git add components/Statement.tsx app/page.tsx
git commit -m "feat(components): Statement with IntersectionObserver reveal"
```

---

## Task 9: `components/ScrollMorph.tsx` — swappable layered scroll element

**Files:**
- Create: `components/ScrollMorph.tsx`

- [ ] **Step 1: Implement.**

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export type MorphLayer =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string };

export interface ScrollMorphProps {
  layers: MorphLayer[];
  copy?: string;
  className?: string;
}

/** opacity for layer i given overall progress p across N layers. */
function layerOpacity(i: number, n: number, p: number): number {
  if (n <= 1) return 1;
  const center = i / (n - 1);
  const span = 1 / (n - 1);
  const distance = Math.abs(p - center);
  if (distance >= span) return 0;
  return 1 - distance / span;
}

export function ScrollMorph({ layers, copy, className }: ScrollMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(containerRef);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    layers.forEach((layer, i) => {
      if (layer.type !== 'video') return;
      const v = videoRefs.current[i];
      if (!v || !isFinite(v.duration)) return;
      const o = layerOpacity(i, layers.length, progress);
      if (o > 0) {
        const local = layers.length === 1 ? progress : (progress - (i / (layers.length - 1))) * (layers.length - 1) + 0.5;
        const clamped = Math.max(0, Math.min(1, local));
        try {
          v.currentTime = clamped * v.duration;
        } catch {}
      }
    });
  }, [progress, layers]);

  return (
    <section ref={containerRef} className={className ?? 'relative h-[200vh]'}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {layers.map((layer, i) => {
          const opacity = layerOpacity(i, layers.length, progress);
          const style = { opacity, transition: 'opacity 80ms linear' as const };
          if (layer.type === 'image') {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={layer.src}
                alt={layer.alt ?? ''}
                className="absolute inset-0 h-full w-full object-cover"
                style={style}
              />
            );
          }
          return (
            <video
              key={i}
              ref={(el) => { videoRefs.current[i] = el; }}
              src={layer.src}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
              style={style}
            />
          );
        })}
        {copy && (
          <p className="absolute bottom-10 left-6 right-6 md:left-10 md:right-auto md:max-w-md font-serif text-2xl md:text-3xl text-ivory">
            {copy}
          </p>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into `app/page.tsx`.**

```tsx
import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';
import { ScrollMorph } from '@/components/ScrollMorph';

export default function Home() {
  return (
    <main>
      <ScrollVideo src="/hero.mp4" />
      <Statement headline="A perfect form." sub="Nothing added. Nothing extra." />
      <ScrollMorph
        layers={[
          { type: 'image', src: '/lamp-room.png', alt: 'Lamp resting on a low coffee table at dusk' },
          { type: 'video', src: '/detail.mp4' },
        ]}
        copy="A small object. A warmer room."
      />
    </main>
  );
}
```

- [ ] **Step 3: Browser check.** Scroll past the statement: image should crossfade into the second video, video should scrub.

- [ ] **Step 4: Commit.**

```bash
git add components/ScrollMorph.tsx app/page.tsx
git commit -m "feat(components): ScrollMorph layered scroll element"
```

---

## Task 10: API route `/api/preorder` — validation + webhook proxy (TDD)

**Files:**
- Create: `app/api/preorder/route.ts`
- Create: `app/api/preorder/route.test.ts`
- Create: `app/api/preorder/validate.ts`

We extract the validator into a pure module so it's trivially testable. The route handler wraps it plus the fetch to Apps Script.

- [ ] **Step 1: Write failing test for the validator.**

`app/api/preorder/validate.test.ts` (new file — adjust vitest.config include if needed; the existing pattern already covers `app/**/*.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { validatePreorder } from './validate';

describe('validatePreorder', () => {
  const good = { name: 'Paolo', email: 'a@b.co', quantity: '1', country: 'Italy', website: '' };

  it('accepts a well-formed payload', () => {
    const r = validatePreorder(good);
    expect(r.ok).toBe(true);
  });

  it('rejects missing name', () => {
    const r = validatePreorder({ ...good, name: '' });
    expect(r.ok).toBe(false);
  });

  it('rejects bad email', () => {
    const r = validatePreorder({ ...good, email: 'not-an-email' });
    expect(r.ok).toBe(false);
  });

  it('rejects bad quantity', () => {
    const r = validatePreorder({ ...good, quantity: '99' });
    expect(r.ok).toBe(false);
  });

  it('rejects honeypot filled', () => {
    const r = validatePreorder({ ...good, website: 'spam' });
    expect(r.ok).toBe(false);
  });

  it('rejects overly long name', () => {
    const r = validatePreorder({ ...good, name: 'x'.repeat(200) });
    expect(r.ok).toBe(false);
  });
});
```

Rename the file path in the test to `app/api/preorder/validate.test.ts`.

- [ ] **Step 2: Run tests — expect failure.**

```bash
npm test
```

- [ ] **Step 3: Implement the validator.**

`app/api/preorder/validate.ts`:
```ts
export interface PreorderInput {
  name?: unknown;
  email?: unknown;
  quantity?: unknown;
  country?: unknown;
  website?: unknown;
}

export interface ValidPreorder {
  name: string;
  email: string;
  quantity: '1' | '2' | '3+';
  country: string;
}

export type ValidationResult =
  | { ok: true; value: ValidPreorder }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QTY = new Set(['1', '2', '3+']);

export function validatePreorder(input: PreorderInput): ValidationResult {
  if (typeof input.website === 'string' && input.website.length > 0) {
    return { ok: false, error: 'invalid' };
  }
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > 120) return { ok: false, error: 'name' };

  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, error: 'email' };

  const quantity = typeof input.quantity === 'string' ? input.quantity : '';
  if (!QTY.has(quantity)) return { ok: false, error: 'quantity' };

  const country = typeof input.country === 'string' ? input.country.trim() : '';
  if (!country || country.length > 80) return { ok: false, error: 'country' };

  return { ok: true, value: { name, email, quantity: quantity as ValidPreorder['quantity'], country } };
}
```

- [ ] **Step 4: Run tests — expect pass.**

```bash
npm test
```
Expected: validator tests all green.

- [ ] **Step 5: Implement the route handler.**

`app/api/preorder/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { validatePreorder } from './validate';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'json' }, { status: 400 });
  }

  const result = validatePreorder(body as Record<string, unknown>);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });

  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return NextResponse.json({ ok: false, error: 'config' }, { status: 500 });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.value),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return NextResponse.json({ ok: false, error: 'upstream' }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'network' }, { status: 502 });
  }
}
```

- [ ] **Step 6: Commit.**

```bash
git add app/api/preorder/
git commit -m "feat(api): /api/preorder with validation and Sheets webhook proxy"
```

---

## Task 11: `components/PreorderForm.tsx`

**Files:**
- Create: `components/PreorderForm.tsx`
- Create: `lib/countries.ts`

- [ ] **Step 1: Create the country list.**

`lib/countries.ts`:
```ts
export const COUNTRIES = [
  'Italy','United States','United Kingdom','Germany','France','Spain','Netherlands',
  'Belgium','Switzerland','Austria','Sweden','Norway','Denmark','Finland','Ireland',
  'Portugal','Poland','Czechia','Greece','Hungary','Romania','Canada','Mexico',
  'Brazil','Argentina','Chile','Japan','South Korea','Singapore','Hong Kong',
  'Australia','New Zealand','United Arab Emirates','Saudi Arabia','Israel','Turkey',
  'India','South Africa','Other',
];
```

- [ ] **Step 2: Implement the form.**

`components/PreorderForm.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';

type State = 'idle' | 'sending' | 'success' | 'error';

export function PreorderForm() {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get('name') ?? ''),
      email: String(form.get('email') ?? ''),
      quantity: String(form.get('quantity') ?? ''),
      country: String(form.get('country') ?? ''),
      website: String(form.get('website') ?? ''),
    };
    setState('sending');
    setErrorMsg('');
    try {
      const r = await fetch('/api/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.ok) setState('success');
      else { setState('error'); setErrorMsg(data.error ?? 'error'); }
    } catch {
      setState('error');
      setErrorMsg('network');
    }
  }

  if (state === 'success') {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-serif text-3xl">Reserved.</p>
        <p className="mt-3 text-sm text-mute">Check your inbox when shipping opens.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-md gap-4">
      <label className="grid gap-1 text-sm">
        <span className="text-mute uppercase tracking-[0.2em] text-xs">Name</span>
        <input
          name="name"
          required
          maxLength={120}
          className="border-b border-ink/30 bg-transparent py-2 focus:outline-none focus:border-ink"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-mute uppercase tracking-[0.2em] text-xs">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={200}
          className="border-b border-ink/30 bg-transparent py-2 focus:outline-none focus:border-ink"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-mute uppercase tracking-[0.2em] text-xs">Quantity</span>
        <select
          name="quantity"
          required
          defaultValue="1"
          className="border-b border-ink/30 bg-transparent py-2 focus:outline-none focus:border-ink"
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3+">3 or more</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-mute uppercase tracking-[0.2em] text-xs">Country</span>
        <select
          name="country"
          required
          defaultValue=""
          className="border-b border-ink/30 bg-transparent py-2 focus:outline-none focus:border-ink"
        >
          <option value="" disabled>Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-4 bg-coral text-ink py-3 text-sm uppercase tracking-[0.25em] disabled:opacity-60"
      >
        {state === 'sending' ? 'Sending…' : 'Reserve'}
      </button>

      {state === 'error' && (
        <p className="text-sm text-coral" role="alert">
          Something went wrong ({errorMsg}). Please try again.
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 3: Add a section wrapper and wire into `app/page.tsx`.**

```tsx
import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';
import { ScrollMorph } from '@/components/ScrollMorph';
import { PreorderForm } from '@/components/PreorderForm';

export default function Home() {
  return (
    <main>
      <ScrollVideo src="/hero.mp4" />
      <Statement headline="A perfect form." sub="Nothing added. Nothing extra." />
      <ScrollMorph
        layers={[
          { type: 'image', src: '/lamp-room.png', alt: 'Lamp resting on a low coffee table at dusk' },
          { type: 'video', src: '/detail.mp4' },
        ]}
        copy="A small object. A warmer room."
      />
      <section id="preorder" className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <h2 className="font-serif text-5xl md:text-6xl mb-3">Reserve yours.</h2>
        <p className="text-sm uppercase tracking-[0.25em] text-mute mb-12 text-center max-w-sm">
          Limited first run. No payment now — we&rsquo;ll email when shipping opens.
        </p>
        <PreorderForm />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Commit.**

```bash
git add components/PreorderForm.tsx lib/countries.ts app/page.tsx
git commit -m "feat(components): PreorderForm with states + page wiring"
```

---

## Task 12: Footer

**Files:**
- Create: `components/Footer.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Implement.**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-ink/10 px-6 py-8 text-xs text-mute md:flex md:items-center md:justify-between">
      <span>jnl — warmth redefined</span>
      <span>© 2026 · hello@justanicelamp.com</span>
    </footer>
  );
}
```

- [ ] **Step 2: Wire into `app/page.tsx` (after the preorder section, inside `<main>`).**

```tsx
import { Footer } from '@/components/Footer';
// ...
<Footer />
```

- [ ] **Step 3: Commit.**

```bash
git add components/Footer.tsx app/page.tsx
git commit -m "feat(components): footer"
```

---

## Task 13: Env example + Apps Script doc + README

**Files:**
- Create: `.env.local.example`
- Create: `docs/apps-script.md`
- Modify: `README.md`

- [ ] **Step 1: `.env.local.example`.**

```
SHEETS_WEBHOOK_URL=
```

- [ ] **Step 2: `docs/apps-script.md`.**

````markdown
# Google Sheets webhook setup

1. Create a new Google Sheet. In the first row, set headers:
   `timestamp | name | email | quantity | country`
2. Extensions → Apps Script. Replace the contents of `Code.gs` with:

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), d.name, d.email, d.quantity, d.country
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Deploy → New deployment → Type: Web app. Execute as: Me. Who has access: Anyone. Deploy.
4. Copy the Web app URL.
5. Put it in `.env.local`:
   ```
   SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/XXXX/exec
   ```
6. On Vercel, set the same env var in Project Settings → Environment Variables.

To rotate, redeploy the Apps Script as a new version and replace the URL.
````

- [ ] **Step 3: `README.md`.** Overwrite with:

```markdown
# Just a Nice Lamp — Landing

Single-page Next.js site with a scroll-scrubbed hero video, a swappable scroll-driven dual-media section, and a Google Sheets-backed pre-order form.

## Run

```bash
npm install
cp .env.local.example .env.local   # paste your SHEETS_WEBHOOK_URL
npm run dev
```

## Tests

```bash
npm test
```
Covers the scroll progress math and the API validator.

## Deploy

Push to Vercel. Set `SHEETS_WEBHOOK_URL` in Project Settings.

## Sheets webhook

See `docs/apps-script.md`.

## Video scrubbing on iOS

If hero scrubbing stutters on iOS Safari, re-encode with keyframes per frame:
```bash
ffmpeg -i public/hero.mp4 -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 -movflags +faststart -an public/hero.scrub.mp4
mv public/hero.scrub.mp4 public/hero.mp4
```

## Specs / plans

See `docs/superpowers/`.
```

- [ ] **Step 4: Commit.**

```bash
git add .env.local.example docs/apps-script.md README.md
git commit -m "docs: env example, Apps Script setup, README"
```

---

## Task 14: Reduced-motion fallback for `ScrollVideo`

**Files:**
- Modify: `components/ScrollVideo.tsx`

- [ ] **Step 1: Update `ScrollVideo` to honor `prefers-reduced-motion`.**

Replace the component body with:

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { useScrollProgress } from '@/lib/scrollProgress';

export interface ScrollVideoProps {
  src: string;
  className?: string;
  smoothing?: number;
}

export function ScrollVideo({ src, className, smoothing = 0.15 }: ScrollVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(containerRef);
  const targetTime = useRef(0);
  const currentTime = useRef(0);
  const rafId = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isFinite(v.duration)) return;
    targetTime.current = progress * v.duration;
  }, [progress]);

  useEffect(() => {
    if (reducedMotion) return;
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    const tick = () => {
      if (!isFinite(v.duration)) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const diff = targetTime.current - currentTime.current;
      if (Math.abs(diff) > 0.001) {
        currentTime.current += diff * smoothing;
        try { v.currentTime = currentTime.current; } catch {}
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current != null) cancelAnimationFrame(rafId.current); };
  }, [smoothing, reducedMotion]);

  return (
    <div ref={containerRef} className={className ?? 'relative h-[300vh] bg-ink'}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          poster={reducedMotion ? undefined : undefined}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
```

For users with reduced motion the rAF loop never starts; the video stays paused on its first frame. Acceptable static-poster behavior without shipping a separate poster image.

- [ ] **Step 2: Commit.**

```bash
git add components/ScrollVideo.tsx
git commit -m "feat(a11y): honor prefers-reduced-motion in ScrollVideo"
```

---

## Task 15: Final smoke test

- [ ] **Step 1: Run all tests.**

```bash
npm test
```
Expected: all pass.

- [ ] **Step 2: Type-check + lint via build.**

```bash
npm run build
```
Expected: build completes with no type or lint errors.

- [ ] **Step 3: Start dev server and walk through.**

```bash
npm run dev
```
Manually verify in browser:
- Hero: scrolling scrubs the video forward; reverse-scrolling scrubs back. Nav text is readable over both light and dark frames.
- Statement: as it enters viewport, headline + sub fade in. Sub is in uppercase letter-spaced sans.
- Dual moment: image visible first, then crossfades to scrubbing video.
- Pre-order: filling fields and submitting hits `/api/preorder`. Without `SHEETS_WEBHOOK_URL` set, expect a 500 error toast inline. With it set, success message renders and a row appears in the Sheet.
- Footer renders at bottom.
- Resize to mobile width: layout remains usable; no horizontal scroll.

- [ ] **Step 4: Final commit if any tweaks were needed during smoke.**

```bash
git status
# if changes:
git add -A
git commit -m "chore: smoke-test fixes"
```

---

## Self-Review Notes (run during planning)

- **Spec coverage:** Nav → Task 6; Hero → Tasks 5, 7, 14; Statement → Task 8; Dual moment → Task 9; Pre-order → Tasks 10, 11; Footer → Task 12; Apps Script docs → Task 13; iOS keyframe note → Task 7 + 13; Reduced motion → Task 14 (global CSS in Task 2 + component fallback). Palette/fonts → Task 2.
- **Placeholders:** none.
- **Type consistency:** `MorphLayer`, `ScrollVideoProps`, `PreorderInput`, `ValidPreorder`, `ValidationResult` are each defined once and referenced consistently. `useScrollProgress(ref)` signature is identical between `ScrollVideo` and `ScrollMorph`. The form payload keys (`name`, `email`, `quantity`, `country`, `website`) match the validator and the Apps Script `appendRow` order matches the documented sheet headers.
