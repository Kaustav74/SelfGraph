export default function ResultSection({ title, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-500">{title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{children}</div>
    </section>
  );
}
