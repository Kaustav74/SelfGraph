export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">SelfGraph</h1>
        <p className="text-sm text-slate-500">Behavioral intelligence, designed for clarity.</p>
      </div>
    </header>
  );
}
