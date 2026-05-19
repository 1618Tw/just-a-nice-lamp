import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';
import { ScrollMorph } from '@/components/ScrollMorph';
import { PreorderForm } from '@/components/PreorderForm';

export default function Home() {
  return (
    <main>
      <ScrollVideo src="/hero.mp4" />
      <Statement headline="A perfect form." sub="Nothing added. Nothing extra." />
      <ScrollMorph
        layers={[
          { type: 'image', src: '/lamp-room.png', alt: 'Lamp resting on a low coffee table at dusk' },
          { type: 'video', src: '/detail.mp4' },
        ]}
        copy="A small object. A warmer room."
      />
      <section id="preorder" className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <h2 className="font-serif text-5xl md:text-6xl mb-3">Reserve yours.</h2>
        <p className="text-sm uppercase tracking-[0.25em] text-mute mb-12 text-center max-w-sm">
          Limited first run. No payment now — we&rsquo;ll email when shipping opens.
        </p>
        <PreorderForm />
      </section>
    </main>
  );
}
