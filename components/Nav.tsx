export function Nav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5 md:px-10"
      style={{ mixBlendMode: 'difference', color: '#F4EAD8' }}
    >
      <span className="font-serif text-xl tracking-tight">jnl</span>
      <a href="#preorder" className="text-sm uppercase tracking-[0.2em]">
        reserve
      </a>
    </nav>
  );
}
