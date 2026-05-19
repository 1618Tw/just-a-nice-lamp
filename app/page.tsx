import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';

export default function Home() {
  return (
    <main>
      <ScrollVideo src="/hero.mp4" />
      <Statement headline="A perfect form." sub="Nothing added. Nothing extra." />
    </main>
  );
}
