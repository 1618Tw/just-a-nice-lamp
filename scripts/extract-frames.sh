#!/usr/bin/env bash
# Extract N evenly-spaced WebP frames from each source video into
# public/frames/<name>/000.jpg ... NNN.jpg. The components render an
# <img> whose src is swapped on scroll, which works flawlessly on iOS
# Safari (no video decoder quirks, no currentTime seek issues).
#
# Sources are read from media/original/ (originals preserved by the
# reencode-videos script). Output sizes target ~1280px and ffmpeg
# -q:v 5 (~visually-good JPEG), keeping each frame around 40-80 KB.

set -euo pipefail

cd "$(dirname "$0")/.."

SRCDIR=media/original
OUTROOT=public/frames
mkdir -p "$OUTROOT"

# name:target_frame_count:max_width:jpeg_qscale (lower q = higher quality)
# *-mobile entries are vertical (portrait) sources used on phones only.
SPECS=(
  "intro:48:1280:5"
  "hero-lamp:60:1280:5"
  "hero-lamp-mobile:60:1280:5"
  "shapes:60:1280:5"
  "shapes-mobile:60:1280:5"
  "closing:90:960:7"
)

for spec in "${SPECS[@]}"; do
  IFS=':' read -r name target maxw qscale <<<"$spec"
  src="$SRCDIR/${name}.mp4"
  outdir="$OUTROOT/${name}"

  if [[ ! -f "$src" ]]; then
    echo "skip: $src not found"
    continue
  fi

  duration=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$src")
  fps=$(awk -v t="$target" -v d="$duration" 'BEGIN{printf "%.6f", t/d}')

  echo "extract: $src -> $outdir  ($target frames @ ${fps}fps, max ${maxw}px, q=${qscale})"
  rm -rf "$outdir"
  mkdir -p "$outdir"

  ffmpeg -y -hide_banner -loglevel error \
    -i "$src" \
    -vf "fps=${fps},scale='min(${maxw},iw)':'-2'" \
    -frames:v "$target" \
    -q:v "$qscale" \
    -start_number 0 \
    "${outdir}/%03d.jpg"

  count=$(find "$outdir" -name '*.jpg' | wc -l | tr -d ' ')
  size=$(du -sh "$outdir" | cut -f1)
  printf '  -> %s files, %s\n' "$count" "$size"
done

echo
echo "done. total frames dir:"
du -sh "$OUTROOT"
