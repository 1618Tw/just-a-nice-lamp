const VALUES = [
  { title: 'Built in Europe' },
  { title: 'Fully recycled materials' },
  { title: 'A perfect design' },
];

export function Values() {
  return (
    <section className="grid min-h-screen grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-16 md:px-16">
      <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-sm bg-ink md:order-1">
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
      </div>
      <ol className="space-y-10 md:order-2">
        {VALUES.map((v, i) => (
          <li key={v.title} className="border-l-2 border-coral pl-6">
            <span className="block text-xs uppercase tracking-[0.3em] text-mute">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 font-serif text-3xl md:text-4xl">{v.title}</h3>
          </li>
        ))}
      </ol>
    </section>
  );
}
