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
