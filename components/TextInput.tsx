// The input card: textarea, character counter, "Try an example" and Analyze buttons.
// It holds no state of its own. The parent (page.tsx) owns the text and passes
// it down, plus callbacks to call when something happens. This is called a
// "controlled component".

import { MAX_TEXT_LENGTH } from "@/lib/types";

const EXAMPLE_TEXT =
  "I ordered a pair of headphones two weeks ago and they only arrived today. " +
  "The box was damaged and the left ear cup is broken. I'm really disappointed " +
  "because I needed them for a trip. I'd like a refund or a replacement as soon as possible.";

interface TextInputProps {
  text: string;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onAnalyze: () => void;
}

export default function TextInput({
  text,
  isLoading,
  onTextChange,
  onAnalyze,
}: TextInputProps) {
  const tooLong = text.length > MAX_TEXT_LENGTH;

  return (
    <section className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm dark:border-pink-800 dark:bg-pink-900">
      <label
        htmlFor="input-text"
        className="mb-2 block text-sm font-semibold text-pink-700 dark:text-pink-200"
      >
        Your text
      </label>

      <textarea
        id="input-text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={isLoading}
        rows={10}
        placeholder="Paste an email, review, message or any text you want analyzed…"
        className="w-full resize-y rounded-xl border border-pink-300 bg-pink-50 p-3 text-sm leading-relaxed text-pink-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:opacity-60 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-100 dark:focus:ring-amber-900"
      />

      <div className="mt-1 flex justify-end">
        <span
          className={`text-xs ${tooLong ? "font-semibold text-red-600" : "text-slate-500"}`}
        >
          {text.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
        </span>
      </div>

      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => onTextChange(EXAMPLE_TEXT)}
          disabled={isLoading}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-amber-600 transition hover:bg-amber-50 disabled:opacity-50 dark:text-amber-400 dark:hover:bg-pink-800"
        >
          Try an example
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={isLoading || tooLong}
          className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
    </section>
  );
}
