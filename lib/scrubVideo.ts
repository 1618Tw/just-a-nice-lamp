'use client';

// iOS Safari quirk: setting `currentTime` on a paused <video> renders nothing
// until the decoder has been attached and the seek-to position is buffered.
// Calling play() then pause() once "warms" the decoder so subsequent
// currentTime sets actually paint a frame. The promise resolves when the
// element is ready to be scrubbed.
export function prepareScrubVideo(v: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    const warm = () => {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.then === 'function') {
        p.then(() => v.pause())
          .catch(() => {})
          .finally(() => resolve());
      } else {
        try {
          v.pause();
        } catch {
          /* noop */
        }
        resolve();
      }
    };

    if (v.readyState >= 2) {
      warm();
      return;
    }

    const onReady = () => {
      v.removeEventListener('loadeddata', onReady);
      warm();
    };
    v.addEventListener('loadeddata', onReady);
    // preload="auto" is a hint; some mobile browsers ignore it until load() is called.
    try {
      v.load();
    } catch {
      /* noop */
    }
  });
}
