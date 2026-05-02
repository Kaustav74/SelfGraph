'use client';

import { useMemo, useState } from 'react';
import ResultSection from '@/components/ResultSection';
import ScoreBar from '@/components/ui/ScoreBar';

function reportToText(result) {
  return Object.entries(result)
    .map(([key, val]) => `${key.toUpperCase()}\n${typeof val === 'object' ? JSON.stringify(val, null, 2) : val}`)
    .join('\n\n');
}

function LoadingPulse() {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
      <p className="ml-2">AI is building your SelfGraph…</p>
    </div>
  );
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const reportText = useMemo(() => (result ? reportToText(result) : ''), [result]);

  const onFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setChatHistory(await file.text());
  };

  const handleAnalyze = async () => {
    setError('');
    const trimmed = chatHistory.trim();
    if (!trimmed) return setError('Please paste chat history before running analysis.');
    if (trimmed.length < 250) return setError('Input is too short. Paste at least 250 characters for meaningful analysis.');

    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed.');
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyReport = async () => reportText && navigator.clipboard.writeText(reportText);

  const downloadReport = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selfgraph-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-10 md:px-8 md:py-16">
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_4px_30px_rgba(15,23,42,0.06)] md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Personal Intelligence</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">SelfGraph</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Paste your ChatGPT/Gemini history and receive a sharp personality profile, score breakdown, and action system.
        </p>

        <div className="mt-7 space-y-3">
          <textarea
            value={chatHistory}
            onChange={(e) => setChatHistory(e.target.value)}
            placeholder="Paste conversation history…"
            className="min-h-72 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input type="file" accept=".txt" onChange={onFileUpload} className="text-xs text-slate-500" />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Analyzing...' : 'Generate SelfGraph'}
            </button>
          </div>
          {loading && <LoadingPulse />}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </section>

      {result && (
        <section className="mt-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Your SelfGraph Report</h2>
            <div className="flex gap-2">
              <button onClick={copyReport} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50">Copy Report</button>
              <button onClick={downloadReport} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition hover:bg-slate-50">Download Report</button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ScoreBar label="Consistency Score" score={result.scores.consistency.score} explanation={result.scores.consistency.explanation} />
            <ScoreBar label="Execution Score" score={result.scores.execution.score} explanation={result.scores.execution.explanation} />
            <ScoreBar label="Discipline Score" score={result.scores.discipline.score} explanation={result.scores.discipline.explanation} />
          </div>

          {Object.entries(result.sections).map(([section, content]) => (
            <ResultSection key={section} title={section.replace(/_/g, ' ')}>
              {Array.isArray(content) ? (
                <ul className="list-disc space-y-1 pl-5">
                  {content.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              ) : typeof content === 'object' ? (
                <ul className="space-y-1">
                  {Object.entries(content).map(([k, v]) => (
                    <li key={k}><span className="font-medium text-slate-900">{k.replace(/_/g, ' ')}:</span> {Array.isArray(v) ? v.join(', ') : v}</li>
                  ))}
                </ul>
              ) : (
                <p>{content}</p>
              )}
            </ResultSection>
          ))}
        </section>
      )}
    </main>
  );
}
