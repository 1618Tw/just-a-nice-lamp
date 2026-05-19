import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';
import { ScrollMorph } from '@/components/ScrollMorph';

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
    </main>
  );
}
