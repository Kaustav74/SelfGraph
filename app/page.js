'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import InputCard from '@/components/ui/InputCard';
import ActionBar from '@/components/ui/ActionBar';
import ResultCard from '@/components/ui/ResultCard';
import ScoreCard from '@/components/ui/ScoreCard';

const STORAGE_KEY = 'selfgraph_history_v1';
const loadingMessages = ['Analyzing patterns...', 'Detecting contradictions...', 'Mapping behavior...'];

const redactSensitive = (text) => text
  .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
  .replace(/\+?\d[\d\s().-]{7,}\d/g, '[REDACTED_PHONE]')
  .replace(/\b\d{2,}\b/g, '[REDACTED_NUMBER]');

export default function Home() {
  const [chatHistory, setChatHistory] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState('');
  const [processMode, setProcessMode] = useState('ai');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setMessageIndex((i) => (i + 1) % loadingMessages.length), 950);
    return () => clearInterval(id);
  }, [loading]);

  const saveHistory = (entry) => {
    const next = [entry, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const runAnalysis = async (section = 'full') => {
    setError('');
    const trimmed = chatHistory.trim();
    if (!trimmed) return setError('Paste conversation history first.');
    if (trimmed.length < 250) return setError('Please provide at least 250 characters.');

    setLoading(true);
    try {
      const sanitized = redactSensitive(trimmed);
      if (processMode === 'local') {
        const mock = { scores: { consistency: { score: 50 }, execution: { score: 50 }, discipline: { score: 50 } }, sections: { identity_core: { demographics: 'Not enough evidence', role_stage_of_life: 'Not enough evidence' }, behavioral_patterns: { thinking_style: 'Not enough evidence', execution_level: 'Not enough evidence', consistency_pattern: 'Not enough evidence' }, contradictions: ['Local mode: no cloud inference'], limiting_factors: ['Local mode: no cloud inference'], execution_profile: 'Thinker', trajectory: 'Not enough evidence', system_correction_plan: { top_3_weaknesses: ['Not enough evidence'], stop: ['Not enough evidence'], start: ['Not enough evidence'], ignore: ['Not enough evidence'] } } };
        setResult(mock);
        saveHistory({ timestamp: new Date().toISOString(), inputSnapshot: sanitized.slice(0, 2000), scores: mock.scores });
      } else {
        const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatHistory: sanitized, section }) });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setResult(data.result);
        saveHistory({ timestamp: new Date().toISOString(), inputSnapshot: sanitized.slice(0, 2000), scores: data.result.scores });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (v) => {
    if (Array.isArray(v)) return <ul className="list-disc pl-5">{v.map((i, idx) => <li key={idx}>{i}</li>)}</ul>;
    if (typeof v === 'object' && v) return <div className="space-y-1">{Object.entries(v).map(([k, val]) => <p key={k}><span className="capitalize text-neutral-400">{k.replace(/_/g, ' ')}:</span> {Array.isArray(val) ? val.join(', ') : val}</p>)}</div>;
    return <p>{v}</p>;
  };

  const cards = result ? [
    ['Identity', result.sections.identity_core, 'identity_core'],
    ['Behavioral Patterns', result.sections.behavioral_patterns, 'behavioral_patterns'],
    ['Contradictions', result.sections.contradictions, 'contradictions'],
    ['Limiting Factors', result.sections.limiting_factors, 'limiting_factors'],
    ['Execution Profile', result.sections.execution_profile, 'execution_profile'],
    ['Trajectory', result.sections.trajectory, 'trajectory'],
    ['System Plan', result.sections.system_correction_plan, 'system_correction_plan'],
  ] : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Understand Yourself. Precisely.</h2>
          <p className="mt-3 text-neutral-400">A personal intelligence system that reveals patterns, contradictions, and growth paths.</p>
        </div>

        <div className="mx-auto max-w-3xl">
          <InputCard value={chatHistory} onChange={(e) => setChatHistory(e.target.value)} />
          <ActionBar loading={loading} processMode={processMode} setProcessMode={setProcessMode} onAnalyze={() => runAnalysis('full')} onFile={async (e) => setChatHistory(await e.target.files?.[0]?.text() || '')} />
          {loading && <p className="mt-4 animate-pulse text-sm text-neutral-400 transition-all duration-300">{loadingMessages[messageIndex]}</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>

        {result && (
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <ScoreCard scores={result.scores} />
            {cards.map(([title, value, key]) => (
              <ResultCard key={key} title={title} onRegenerate={() => runAnalysis(key)} onEdit={() => setEditing(editing === key ? null : key)}>
                {editing === key ? (
                  <textarea
                    className="min-h-40 w-full rounded-xl border border-neutral-700 bg-black p-3 text-xs"
                    defaultValue={JSON.stringify(value, null, 2)}
                    onBlur={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setResult((prev) => ({ ...prev, sections: { ...prev.sections, [key]: parsed } }));
                      } catch {
                        setError('Invalid JSON while editing section.');
                      }
                    }}
                  />
                ) : (
                  renderValue(value)
                )}
              </ResultCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
