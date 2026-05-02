function Meter({ label, score }) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm"><span className="text-neutral-300">{label}</span><span className="font-semibold text-white">{s}</span></div>
      <div className="h-2 rounded-full bg-neutral-800">
        <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${s}%` }} />
      </div>
    </div>
  );
}

export default function ScoreCard({ scores }) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-lg">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-neutral-300">Scoring Dashboard</h3>
      <div className="space-y-4">
        <Meter label="Consistency" score={scores?.consistency?.score} />
        <Meter label="Execution" score={scores?.execution?.score} />
        <Meter label="Discipline" score={scores?.discipline?.score} />
      </div>
    </section>
  );
}
