const VALUES = [
  'Built in Europe',
  'Fully recycled materials',
  'A perfect design',
];

export function Values() {
  return (
    <section className="grid min-h-screen grid-cols-1 items-center gap-16 px-6 py-32 md:grid-cols-12 md:gap-20 md:px-16">
      <div className="relative md:order-1 md:col-span-7">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[640px] overflow-hidden bg-ink">
          <video
            src="/detail.mp4"
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-ink/10" />
        </div>
      </div>

      <div className="md:order-2 md:col-span-5">
        <span className="block text-xs uppercase tracking-[0.45em] text-mute">Edition 01</span>
        <h2
          className="mt-5 font-serif leading-[1.02]"
          style={{ fontSize: 'clamp(44px, 6vw, 96px)', letterSpacing: '-0.01em' }}
        >
          Considered, end to end.
        </h2>
        <ol className="mt-14 space-y-10">
          {VALUES.map((title, i) => (
            <li key={title} className="flex items-baseline gap-7">
              <span
                className="font-serif text-coral"
                style={{ fontSize: 'clamp(28px, 3.5vw, 56px)' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="font-serif leading-tight"
                style={{ fontSize: 'clamp(32px, 4.2vw, 68px)', letterSpacing: '-0.005em' }}
              >
                {title}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
