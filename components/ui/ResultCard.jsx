export default function ResultCard({ title, children, onRegenerate, onEdit }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg transition-all duration-300 hover:scale-[1.01] hover:border-neutral-700">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-neutral-300">{title}</h3>
        <div className="flex gap-2">
          {onRegenerate && <button onClick={onRegenerate} className="rounded-lg border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-all duration-300 hover:border-neutral-500">Regenerate</button>}
          {onEdit && <button onClick={onEdit} className="rounded-lg border border-neutral-700 px-2 py-1 text-xs text-neutral-300 transition-all duration-300 hover:border-neutral-500">Edit</button>}
        </div>
      </div>
      <div className="space-y-2 text-sm text-neutral-200">{children}</div>
    </section>
  );
}
