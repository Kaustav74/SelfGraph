export default function ResultSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h3>
      <div className="space-y-2 text-sm text-slate-200">{children}</div>
    </section>
  );
}
