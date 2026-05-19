# Just a Nice Lamp — Landing Page Design

**Date:** 2026-05-19
**Owner:** Paolo Lancellotti
**Status:** Approved for planning

## Purpose

A short, modern landing page for **Just a Nice Lamp** (jnl) that:

1. Shows the lamp through two scroll-driven video moments and one editorial image.
2. Anchors the experience to a single idea: **"A perfect form."**
3. Collects pre-order interest into a Google Sheet.

Not a full e-commerce site. No checkout, no CMS, no analytics, no i18n, no cookie banner.

## Brand

- **Name:** Just a Nice Lamp (lowercase "a"). Mark: `jnl`.
- **Tagline (footer):** warmth redefined.
- **Core message (hero & mid-page):** *A perfect form.*
- **Tone:** warm, restrained, editorial. Sentences end in periods.

### Palette

| Token        | Hex       | Use                          |
|--------------|-----------|------------------------------|
| `ivory`      | `#F4EAD8` | Page background              |
| `coral`      | `#C04A2D` | Single accent (lamp glow)    |
| `ink`        | `#1F1B16` | All text                     |
| `mute`       | `#A89E8E` | Captions, dividers, helpers  |

### Typography

- **Display:** Instrument Serif (via `next/font/google`). Used only for the wordmark and "A perfect form."
- **Body:** Inter. All other text.

## Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind v4
- No animation library. CSS transitions + IntersectionObserver + `requestAnimationFrame`.
- Deploy: Vercel.

## File layout

```
app/
  layout.tsx              # fonts, metadata, <body> background
  page.tsx                # composes the five sections
  globals.css             # Tailwind, CSS vars for the palette, font vars
  api/preorder/route.ts   # POST → forwards to Apps Script webhook
components/
  Nav.tsx                 # fixed top: "jnl" mark left, anchor link right
  ScrollVideo.tsx         # scroll-scrubbed <video>
  ScrollMorph.tsx         # crossfade between layers (image|video) on scroll
  Statement.tsx           # full-viewport centered headline
  PreorderForm.tsx        # form + states
  Footer.tsx
lib/
  scrollProgress.ts       # shared hook: progress through a ref'd element
public/
  hero.mp4                # IyrHEMHY (renamed)
  detail.mp4              # XybzC1bU (renamed)
  lamp-room.png           # the dog-on-rug photo
docs/
  apps-script.md          # paste-in script + deploy steps
.env.local.example        # SHEETS_WEBHOOK_URL=
README.md
```

## Page composition (top → bottom)

### 1. Nav (fixed, transparent)
- Left: `jnl` (Instrument Serif, small).
- Right: `reserve` (anchors to `#preorder`).
- Color: `ink` on `ivory`; switches to `ivory` while overlapping a dark hero section (use `mix-blend-mode: difference` to avoid JS).

### 2. Hero — `ScrollVideo`
- Outer container `height: 300vh`.
- Inner sticky `h-screen` holds `<video src="/hero.mp4" muted playsInline preload="auto" />`.
- Scroll progress 0→1 maps to `video.currentTime = duration * progress`, smoothed with `requestAnimationFrame` lerp (factor ~0.12).
- Overlay text fades:
  - 0–15%: `jnl` mark grows in.
  - 15–55%: hidden (let the video breathe).
  - 55–85%: "Just a Nice Lamp" (Instrument Serif, large, centered, low-contrast).
  - 85–100%: faint scroll cue at bottom.
- Background while video loads: `ink` (avoids ivory flash).

### 3. Statement — full viewport
- `ivory` background.
- Center: **A perfect form.** (Instrument Serif, ~clamp(64px, 12vw, 180px))
- Below, small sans: *Nothing added. Nothing extra.* (`mute`)
- Fade + slight Y rise on first view via IntersectionObserver.

### 4. Dual moment — `ScrollMorph`
- Sticky container, ~200vh tall.
- Layers (rendered stacked, opacity driven by scroll progress):
  - Layer A: `lamp-room.png` (object-fit: cover)
  - Layer B: `detail.mp4` (also scroll-scrubbed for the portion where its opacity > 0)
- Crossfade window: A fully visible 0–35%, blend 35–65%, B fully visible 65–100%.
- Side copy (left on desktop, top on mobile): "A small object. A warmer room." → fades to "Held in the palm of a room." at the crossover.
- **Designed for replacement.** `ScrollMorph` accepts `layers={Layer[]}` so this section can later become a different animation without touching `page.tsx` structure.

### 5. Pre-order — `PreorderForm` (id `preorder`)
- Heading: **Reserve yours.** (serif)
- Subheading: *Limited first run. No payment now — we'll email when shipping opens.* (sans, `mute`)
- Fields (all required except honeypot):
  - `name` — text
  - `email` — email
  - `quantity` — select: 1, 2, 3+
  - `country` — select, ISO list (use a small hardcoded array of ~40 popular countries to avoid a dependency)
  - `website` — honeypot, hidden, must be empty
- Submit button: filled `coral`, ink text.
- States: idle → submitting (button disabled, label "Sending…") → success (form replaced with "Reserved. Check your inbox.") → error (inline message, form retained).
- No client-side framework state library — `useState`.

### 6. Footer
- Single row, small text in `mute`: `jnl — warmth redefined · © 2026 · hello@justanicelamp.com`

## Scroll mechanics

### `lib/scrollProgress.ts`
```ts
useScrollProgress(ref: RefObject<HTMLElement>): number
```
Returns progress 0→1 of how far the element has traveled through the viewport. Uses a single `scroll` listener on `window` with `requestAnimationFrame` coalescing (one rAF max per frame regardless of subscribers). Returns 0 outside the active range.

### `ScrollVideo`
- Reads progress, lerps target `currentTime`, applies in rAF.
- On mount: pauses video, sets `currentTime = 0`, calls `video.load()`.
- Cleanup: cancels rAF, removes listeners.

### `ScrollMorph`
- Reads progress, computes per-layer opacity.
- Video layers receive the same scroll-scrub treatment as `ScrollVideo` while their opacity > 0.

### iOS scrubbing
- MP4s must have keyframes per frame for smooth scrub. Re-encode if needed:
  ```sh
  ffmpeg -i src.mp4 -c:v libx264 -preset slow -crf 20 -g 1 -keyint_min 1 -movflags +faststart -an out.mp4
  ```
- Document this in `README.md`. The current hero (1.3 MB) is small enough that re-encoded size is acceptable.
- `<video>` attributes: `muted playsInline preload="auto"` and (for iOS) `webkit-playsinline` attribute via `suppressHydrationWarning` if needed.

## Form → Google Sheets

### Request flow
```
PreorderForm  --POST /api/preorder-->  route.ts  --POST--> Apps Script Web App --append--> Sheet
```

### `app/api/preorder/route.ts`
- Reads JSON body.
- Validates: `name` non-empty (≤120 chars), `email` matches a simple RFC-lite regex, `quantity` ∈ {1,2,3+}, `country` non-empty (≤80 chars), `website` empty.
- If validation fails: 400 with `{ ok: false, error }`.
- POSTs JSON to `process.env.SHEETS_WEBHOOK_URL` with a 5s timeout.
- Returns `{ ok: true }` on 2xx, else 502.

### Apps Script (in `docs/apps-script.md`)
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
Deploy: script.google.com → New project → paste → Deploy → Web app → Execute as: me → Who has access: Anyone → copy URL into `.env.local` as `SHEETS_WEBHOOK_URL`.

The sheet header row (set manually once): `timestamp | name | email | quantity | country`.

## Responsive

- Single breakpoint: `md` (768px).
- Below `md`: stack copy above media in Dual moment; reduce serif sizes via `clamp()`.
- Hero scroll container reduces to `220vh` on mobile to keep total page length tight.

## Accessibility

- Videos: `aria-hidden="true"` since they are decorative; the page meaning is in the text.
- Form fields have visible labels (not placeholder-only).
- Honeypot field is `aria-hidden` and visually hidden but in the tab order is removed via `tabIndex={-1}`.
- Color contrast: ink-on-ivory passes AAA; coral-on-ink for the submit button passes AA.
- Reduced motion: when `prefers-reduced-motion: reduce`, replace `ScrollVideo` with a static poster frame and disable `ScrollMorph` scrubbing (cross-fade still works via opacity transitions but on viewport enter, not scroll).

## Performance

- Both videos shipped as-is from `public/`. No streaming.
- Image: PNG kept; Next.js Image optimization handles the rest.
- Fonts via `next/font` (self-hosted, no FOUT).
- No client-side framework beyond React and the scroll hook.
- Target Lighthouse Performance ≥ 90 on desktop.

## What is explicitly out of scope

- Any analytics or tracking.
- Cookie banner / consent.
- Payment processing.
- Internationalization.
- Admin UI (the Google Sheet is the admin).
- A CMS.
- Email confirmation to the user (handled later if desired — Apps Script can send via `MailApp` in a follow-up).
- Server-side rate limiting (the honeypot + Apps Script's per-IP limits are enough for a launch).

## Environment

`.env.local.example`:
```
SHEETS_WEBHOOK_URL=
```
The same key set in Vercel project settings.

## Open items (intentional, low-risk)

- Exact copy in sections 3 and 4 is placeholder-quality and can be tuned without code changes.
- Country list is a hardcoded short list; can be swapped for a fuller list later.
- Email confirmation can be added to the Apps Script in a small follow-up.
