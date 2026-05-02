export default function ResultCard({ title, children, onRegenerate, onEdit }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{title}</h3>
        <div className="flex gap-2">
          {onRegenerate && <button onClick={onRegenerate} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 transition-all duration-300 hover:border-slate-400">Regenerate</button>}
          {onEdit && <button onClick={onEdit} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 transition-all duration-300 hover:border-slate-400">Edit</button>}
        </div>
      </div>
      <div className="space-y-2 text-sm text-slate-700">{children}</div>
    </section>
  );
}
