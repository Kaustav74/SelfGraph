export default function ResultSection({ title, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_2px_16px_rgba(15,23,42,0.04)] transition hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}
