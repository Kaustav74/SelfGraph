'use client';

import { useEffect, useMemo, useState } from 'react';
import ResultSection from '@/components/ResultSection';
import ScoreBar from '@/components/ui/ScoreBar';

const STORAGE_KEY = 'selfgraph_history_v1';
const scoreKeys = ['consistency', 'execution', 'discipline', 'contradiction_index', 'clarity_index'];

const redactSensitive = (text) => text
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
  .replace(/\+?\d[\d\s().-]{7,}\d/g, '[REDACTED_PHONE]')
  .replace(/\b\d{2,}\b/g, '[REDACTED_NUMBER]')
  .replace(/\b([A-Z][a-z]{2,}\s[A-Z][a-z]{2,})\b/g, '[REDACTED_NAME]');

export default function Home() {
  const [chatHistory, setChatHistory] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('fast');
  const [developerMode, setDeveloperMode] = useState(false);
  const [processMode, setProcessMode] = useState('ai');
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  const saveHistory = (entry) => {
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleAnalyze = async (section = 'full') => {
    setError('');
    const trimmed = chatHistory.trim();
    if (!trimmed) return setError('Please paste chat history.');
    if (trimmed.length < 250) return setError('Provide at least 250 characters for reliable analysis.');

    setLoading(true);
    try {
      const sanitized = redactSensitive(trimmed);
      if (processMode === 'local') {
        const mock = {
          scores: Object.fromEntries(scoreKeys.map((k) => [k, { score: 50, explanation: 'Local-only mode uses heuristic placeholders.' }])),
          sections: { identity_core: { demographics: 'Not enough evidence', role_stage_of_life: 'Not enough evidence' }, driving_forces: { motivations: ['Not enough evidence'], goals_inferred: ['Not enough evidence'] }, behavioral_patterns: { thinking_style: 'Not enough evidence', execution_level: 'Not enough evidence', consistency_pattern: 'Not enough evidence' }, contradictions: ['Local-only mode: no cloud inference.'], limiting_factors: ['Local-only mode: no cloud inference.'], execution_profile: 'Thinker', trajectory: 'Not enough evidence', system_correction_plan: { top_3_weaknesses: ['Not enough evidence'], stop: ['Not enough evidence'], start: ['Not enough evidence'], ignore: ['Not enough evidence'] }, seven_day_execution_plan: { day_1: 'Define one measurable goal.', day_2: 'Track one behavior.', day_3: 'Complete one hard task.', day_4: 'Remove one distraction.', day_5: 'Repeat day 3.', day_6: 'Review patterns.', day_7: 'Set next week plan.' }, failure_warning: 'Without data-backed review, blind spots persist.' },
        };
        setResult(mock);
        const entry = { timestamp: new Date().toISOString(), inputSnapshot: sanitized.slice(0, 2000), scores: mock.scores };
        saveHistory(entry);
        setTelemetry({ model: 'local-mock', durationMs: 0, inputTokens: 0, outputTokens: 0, costEstimateUSD: '0.0000' });
      } else {
        const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatHistory: sanitized, model, section }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setResult(data.result);
        setTelemetry(data.telemetry);
        const entry = { timestamp: new Date().toISOString(), inputSnapshot: sanitized.slice(0, 2000), scores: data.result.scores };
        saveHistory(entry);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const previous = history[1];
  const scoreDelta = (key) => {
    if (!result || !previous) return null;
    return result.scores[key].score - previous.scores[key].score;
  };

  const stages = ['Analyzing patterns...', 'Detecting contradictions...', 'Mapping behavior...'];
  const stage = stages[Math.floor((Date.now() / 900) % stages.length)];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">SelfGraph</h1>
          <p className="mt-2 text-sm text-slate-300">A personal intelligence mirror that tracks behavioral truth over time.</p>
          <p className="mt-2 text-xs text-slate-400">Data notice: only redacted text is sent to AI. Emails, phones, names, and long numbers are masked locally.</p>
          <textarea value={chatHistory} onChange={(e) => setChatHistory(e.target.value)} className="mt-5 min-h-64 w-full rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm outline-none focus:border-slate-500" placeholder="Paste chat history..." />
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <input type="file" accept=".txt" onChange={async (e) => setChatHistory(await e.target.files?.[0]?.text() || '')} className="text-slate-300" />
            <select value={model} onChange={(e) => setModel(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"><option value="fast">Fast</option><option value="accurate">Accurate</option></select>
            <select value={processMode} onChange={(e) => setProcessMode(e.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"><option value="ai">Send to AI</option><option value="local">Process locally only</option></select>
            <button onClick={() => handleAnalyze('full')} disabled={loading} className="rounded-xl bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-200">Run Full Analysis</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {['contradictions', 'system_correction_plan', 'scores'].map((sec) => (
              <button key={sec} onClick={() => handleAnalyze(sec)} disabled={loading} className="rounded-lg border border-slate-700 px-3 py-1 hover:bg-slate-800">Regenerate: {sec}</button>
            ))}
            <button onClick={() => setDeveloperMode((v) => !v)} className="rounded-lg border border-slate-700 px-3 py-1">Dev Mode</button>
          </div>
          {loading && <p className="mt-3 animate-pulse text-sm text-slate-300">{stage}</p>}
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </section>

        {result && <section className="grid gap-4 md:grid-cols-5">{scoreKeys.map((k) => <ScoreBar key={k} label={k.replace(/_/g,' ')} score={result.scores[k].score} explanation={result.scores[k].explanation} />)}</section>}

        {result && <section className="grid gap-4 md:grid-cols-2">{Object.entries(result.sections).map(([k, v]) => <EditableSection key={k} name={k} value={v} onSave={(next) => setResult((prev) => ({ ...prev, sections: { ...prev.sections, [k]: next } }))} />)}</section>}

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">Evolution Dashboard</h2>
          <p className="text-xs text-slate-400">Compares the latest report with the previous saved analysis.</p>
          <div className="mt-3 grid gap-3 md:grid-cols-5 text-sm">{scoreKeys.map((k) => <div key={k} className="rounded-xl border border-slate-700 p-3"><p className="capitalize text-slate-300">{k.replace(/_/g,' ')}</p><p className="mt-1 font-semibold">{result?.scores?.[k]?.score ?? '-'} {scoreDelta(k) !== null && <span className={scoreDelta(k) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>({scoreDelta(k) >= 0 ? '+' : ''}{scoreDelta(k)})</span>}</p></div>)}</div>
          <p className="mt-3 text-xs text-slate-500">Saved analyses: {history.length}</p>
        </section>

        {developerMode && telemetry && <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-xs text-slate-300"><p>Model: {telemetry.model}</p><p>Response Time: {telemetry.durationMs} ms</p><p>Input Tokens: {telemetry.inputTokens}</p><p>Output Tokens: {telemetry.outputTokens}</p><p>Estimated Cost (USD): {telemetry.costEstimateUSD}</p></section>}
      </div>
    </main>
  );
}

function EditableSection({ name, value, onSave }) {
  const [draft, setDraft] = useState(JSON.stringify(value, null, 2));
  useEffect(() => setDraft(JSON.stringify(value, null, 2)), [value]);
  return (
    <ResultSection title={name.replace(/_/g, ' ')}>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="min-h-40 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs" />
      <button onClick={() => { try { onSave(JSON.parse(draft)); } catch { } }} className="mt-2 rounded-lg border border-slate-600 px-3 py-1 text-xs">Save edits</button>
    </ResultSection>
  );
}
