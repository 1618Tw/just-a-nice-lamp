'use client';
import { useState } from 'react';
import { COUNTRIES } from '@/lib/countries';

type State = 'idle' | 'sending' | 'success' | 'error';

interface PreorderFormProps {
  layout?: 'vertical' | 'horizontal';
}

export function PreorderForm({ layout = 'vertical' }: PreorderFormProps = {}) {
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const horizontal = layout === 'horizontal';

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
    <form
      onSubmit={onSubmit}
      className={
        horizontal
          ? 'grid w-full gap-x-6 gap-y-4 md:grid-cols-2 md:items-end'
          : 'mx-auto grid w-full max-w-md gap-4'
      }
    >
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
        className={
          horizontal
            ? 'mt-2 bg-coral text-ink py-3 text-sm uppercase tracking-[0.25em] disabled:opacity-60 md:col-span-2'
            : 'mt-4 bg-coral text-ink py-3 text-sm uppercase tracking-[0.25em] disabled:opacity-60'
        }
      >
        {state === 'sending' ? 'Sending…' : 'Reserve'}
      </button>

      {state === 'error' && (
        <p
          className={horizontal ? 'text-sm text-coral md:col-span-2' : 'text-sm text-coral'}
          role="alert"
        >
          Something went wrong ({errorMsg}). Please try again.
        </p>
      )}
    </form>
  );
}
