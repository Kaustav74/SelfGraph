function Meter({ label, score }) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm"><span className="text-slate-500">{label}</span><span className="font-semibold text-slate-900">{s}</span></div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-slate-900 transition-all duration-700" style={{ width: `${s}%` }} />
      </div>
    </div>
  );
}

export default function ScoreCard({ scores }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Scoring Dashboard</h3>
      <div className="space-y-4">
        <Meter label="Consistency" score={scores?.consistency?.score} />
        <Meter label="Execution" score={scores?.execution?.score} />
        <Meter label="Discipline" score={scores?.discipline?.score} />
      </div>
    </section>
  );
}
