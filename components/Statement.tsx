'use client';
import { MagicText } from '@/components/ui/magic-text';

export function Statement() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-ivory px-6 md:px-16">
      <div className="max-w-5xl">
        <MagicText
          text="I wanted to see how far flat lights can go. If we see them from another perspective, they could be invisible, feel very light, and at the same time the biggest presence in the room."
          className="text-ink"
        />
      </div>
    </section>
  );
}
