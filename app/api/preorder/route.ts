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
