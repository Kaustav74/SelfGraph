export default function ScoreBar({ label, score, explanation }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-sm font-semibold text-slate-900">{clamped}</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900 transition-all duration-700" style={{ width: `${clamped}%` }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{explanation}</p>
    </div>
  );
}
