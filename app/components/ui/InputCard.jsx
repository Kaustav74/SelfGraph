export default function InputCard({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Paste your ChatGPT / Groq / Gemini conversation history here..."
        className="min-h-64 w-full resize-y bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
      />
    </div>
  );
}
