#!/usr/bin/env bash
# Re-encode public/*.mp4 so they actually scrub on iOS Safari and produce a
# first-frame JPG poster for each. Originals are backed up to media/original/
# (which is gitignored) before being overwritten.
#
# Key flags:
#   -movflags +faststart   moov atom at the start so the file is seekable
#                          while it is still downloading.
#   -g 2 -keyint_min 2     a keyframe every 2 frames. Without this iOS lands
#                          on the previous keyframe (often seconds away) and
#                          scrubbing snaps to ~15 positions.
#   -pix_fmt yuv420p       required by Safari.
#   -profile:v main 3.1    broad mobile compatibility.
#   scale to <=1280px      mobile-friendly file size; these are background
#                          videos so extra resolution is wasted.

set -euo pipefail

cd "$(dirname "$0")/.."

PUBLIC=public
BACKUP=media/original
mkdir -p "$BACKUP"

VIDEOS=(intro.mp4 hero-lamp.mp4 shapes.mp4 closing.mp4)

for name in "${VIDEOS[@]}"; do
  src="$PUBLIC/$name"
  if [[ ! -f "$src" ]]; then
    echo "skip: $src not found"
    continue
  fi

  # Back up the original once, never overwrite an existing backup.
  if [[ ! -f "$BACKUP/$name" ]]; then
    cp "$src" "$BACKUP/$name"
    echo "backup: $BACKUP/$name"
  fi

  base="${name%.mp4}"
  tmp="$PUBLIC/${base}.tmp.mp4"
  poster="$PUBLIC/${base}-poster.jpg"

  echo "encode: $src"
  ffmpeg -y -hide_banner -loglevel error \
    -i "$BACKUP/$name" \
    -vf "scale='min(1280,iw)':'-2'" \
    -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p \
    -g 2 -keyint_min 2 -sc_threshold 0 \
    -crf 28 -preset slow \
    -movflags +faststart \
    -an \
    "$tmp"
  mv "$tmp" "$src"
  printf '  -> %s\n' "$(du -h "$src" | cut -f1) $src"

  echo "poster: $poster"
  ffmpeg -y -hide_banner -loglevel error \
    -ss 0 -i "$BACKUP/$name" \
    -frames:v 1 -q:v 4 \
    -vf "scale='min(1280,iw)':'-2'" \
    "$poster"
  printf '  -> %s\n' "$(du -h "$poster" | cut -f1) $poster"
done

echo
echo "done. originals preserved in $BACKUP/"
