export default function ActionBar({ loading, processMode, setProcessMode, onAnalyze, onFile }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button onClick={onAnalyze} disabled={loading} className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:bg-neutral-200 disabled:opacity-60">
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      <label className="cursor-pointer rounded-xl border border-neutral-700 px-4 py-2 text-sm text-neutral-200 transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-900">
        Upload file
        <input type="file" accept=".txt" onChange={onFile} className="hidden" />
      </label>
      <select value={processMode} onChange={(e) => setProcessMode(e.target.value)} className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-200 focus:outline-none">
        <option value="ai">Groq model</option>
        <option value="local">Local only</option>
      </select>
    </div>
  );
}
