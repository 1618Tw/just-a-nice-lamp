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
