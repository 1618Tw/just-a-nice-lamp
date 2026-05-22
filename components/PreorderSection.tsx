import { PreorderForm } from './PreorderForm';

export function PreorderSection() {
  return (
    <section
      id="preorder"
      className="flex min-h-screen items-center justify-center bg-ivory px-6 py-24 md:px-16"
    >
      <div className="w-full max-w-md">
        <span className="block text-center text-[10px] uppercase tracking-[0.45em] text-mute">
          Pre-order
        </span>
        <h2
          className="mt-3 text-center font-serif text-4xl md:text-5xl"
          style={{ letterSpacing: '-0.01em' }}
        >
          Reserve yours.
        </h2>
        <p className="mx-auto mt-3 mb-10 max-w-xs text-center text-xs leading-relaxed text-mute">
          Limited first run. No payment now, we&rsquo;ll email when shipping opens.
        </p>
        <PreorderForm />
      </div>
    </section>
  );
}
