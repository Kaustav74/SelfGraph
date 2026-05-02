export default function ActionBar({ loading, processMode, setProcessMode, onAnalyze, onFile }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button onClick={onAnalyze} disabled={loading} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:bg-slate-700 disabled:opacity-60">
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50">
        Upload file
        <input type="file" accept=".txt" onChange={onFile} className="hidden" />
      </label>
      <select value={processMode} onChange={(e) => setProcessMode(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none">
        <option value="ai">Groq model</option>
        <option value="local">Local only</option>
      </select>
    </div>
  );
}
