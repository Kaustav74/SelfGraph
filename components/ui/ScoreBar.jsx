export default function ScoreBar({ label, score, explanation }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mb-2 flex justify-between text-xs"><span className="capitalize text-slate-400">{label}</span><span>{clamped}</span></div>
      <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${clamped}%` }} /></div>
      <p className="mt-2 text-xs text-slate-400">{explanation}</p>
    </div>
  );
}
