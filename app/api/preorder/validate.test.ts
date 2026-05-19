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
