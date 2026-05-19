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
