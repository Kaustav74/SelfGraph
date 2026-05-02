export default function InputCard({ value, onChange }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-lg transition-all duration-300 hover:border-neutral-700">
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Paste your ChatGPT / Groq / Gemini conversation history here..."
        className="min-h-64 w-full resize-y bg-transparent text-sm text-white placeholder:text-neutral-500 focus:outline-none"
      />
    </div>
  );
}
