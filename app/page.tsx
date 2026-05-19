import { ScrollVideo } from '@/components/ScrollVideo';
import { Statement } from '@/components/Statement';
import { Values } from '@/components/Values';
import { FormOverImage } from '@/components/FormOverImage';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <ScrollVideo
        src="/hero.mp4"
        kicker="Edition 01 — A new object"
        headline="Just a Nice Lamp"
      />
      <Statement headline="A perfect form." sub="Nothing added. Nothing extra." />
      <Values />
      <FormOverImage />
      <Footer />
    </main>
  );
}
