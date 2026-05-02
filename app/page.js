'use client';

import { useMemo, useState } from 'react';
import ResultSection from '@/components/ResultSection';

const emptyResult = null;

function formatAnalysisForDownload(result) {
  return Object.entries(result)
    .map(([section, content]) => {
      const title = section.replace(/_/g, ' ').toUpperCase();
      if (Array.isArray(content)) {
        return `${title}\n${content.map((item) => `- ${item}`).join('\n')}`;
      }
      if (typeof content === 'object' && content !== null) {
        return `${title}\n${Object.entries(content)
          .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n')}`;
      }
      return `${title}\n${content}`;
    })
    .join('\n\n');
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(emptyResult);

  const downloadText = useMemo(() => (result ? formatAnalysisForDownload(result) : ''), [result]);

  const onFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setChatHistory(text);
  };

  const handleAnalyze = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatHistory }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze input');
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!downloadText) return;
    await navigator.clipboard.writeText(downloadText);
  };

  const handleDownload = () => {
    if (!downloadText) return;
    const blob = new Blob([downloadText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selfgraph-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 p-6 md:p-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">SelfGraph</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Paste your chat history to generate a structured Self Profile and a personalized Improvement System.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="mb-2 block text-sm font-medium">Chat history input</label>
        <textarea
          value={chatHistory}
          onChange={(e) => setChatHistory(e.target.value)}
          className="min-h-60 w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700"
          placeholder="Paste ChatGPT, Gemini, or other chat history here..."
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input type="file" accept=".txt" onChange={onFileUpload} className="text-sm" />
          <button
            onClick={handleAnalyze}
            disabled={!chatHistory.trim() || loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? 'Analyzing...' : 'Generate SelfGraph'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </section>

      {result && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-semibold">SelfGraph Results</h2>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="rounded-lg border px-3 py-2 text-sm">Copy</button>
              <button onClick={handleDownload} className="rounded-lg border px-3 py-2 text-sm">Download</button>
            </div>
          </div>

          {Object.entries(result).map(([section, content]) => (
            <ResultSection key={section} title={section.replace(/_/g, ' ')}>
              {Array.isArray(content) ? (
                <ul className="list-disc space-y-1 pl-5">
                  {content.map((item, idx) => (
                    <li key={`${section}-${idx}`}>{item}</li>
                  ))}
                </ul>
              ) : typeof content === 'object' && content !== null ? (
                <ul className="space-y-1">
                  {Object.entries(content).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                      {Array.isArray(value) ? value.join(', ') : value}
                    </li>
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
