// The main page. It OWNS the state and runs the "click Analyze" flow.
// The components only display things. This file decides what happens.
//
// "use client" is needed because this page uses state (useState) and reacts
// to clicks, which can only happen in the browser. (Pages are server-rendered
// by default in the Next.js App Router.)
"use client";

import { useRef, useState } from "react";
import TextInput from "@/components/TextInput";
import AnalysisResults from "@/components/AnalysisResults";
import LoadingState from "@/components/LoadingState";
import ErrorMessage from "@/components/ErrorMessage";
import RecentAnalyses from "@/components/RecentAnalyses";
import {
  addToHistory,
  clearHistory,
  deleteFromHistory,
  useHistory,
  type HistoryItem,
} from "@/lib/history";
import type { AnalysisResult, ApiError } from "@/lib/types";

export default function Home() {
  // The page's state:
  const [text, setText] = useState(""); // what the user typed
  const [isLoading, setIsLoading] = useState(false); // waiting for the server?
  const [result, setResult] = useState<AnalysisResult | null>(null); // last success
  const [error, setError] = useState<string | null>(null); // last error

  // History (saved in localStorage by lib/history.ts):
  const history = useHistory(); // the saved list, newest first
  const [selectedId, setSelectedId] = useState<string | null>(null); // which saved item is shown
  const resultsRef = useRef<HTMLElement>(null); // used to scroll the results into view

  /** Show a saved analysis in the results section. No AI call, no cost. */
  function handleSelectHistory(item: HistoryItem) {
    setText(item.text);
    setResult(item.result);
    setError(null);
    setSelectedId(item.id);
    // On phones the results are above the history, so scroll up to them.
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleDeleteHistory(id: string) {
    deleteFromHistory(id);
    if (id === selectedId) setSelectedId(null);
  }

  function handleClearHistory() {
    if (window.confirm("Delete all saved analyses? This can't be undone.")) {
      clearHistory();
      setSelectedId(null);
    }
  }

  async function handleAnalyze() {
    // Step 2: quick check in the browser. No need to bother the server.
    if (text.trim().length === 0) {
      setResult(null);
      setError("Please enter some text to analyze.");
      return;
    }

    // Step 3: enter the loading state and clear old output.
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSelectedId(null);

    try {
      // Step 4: call OUR endpoint (not the AI directly; see app/api/analyze/route.ts).
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      // Steps 5–7 happen on the server. Here we receive its answer (step 8).
      const data: AnalysisResult | ApiError = await response.json();

      if (!response.ok || "error" in data) {
        setError("error" in data ? data.error : "Unexpected server response.");
        return;
      }
      setResult(data);

      // NEW: save the successful analysis to the history (localStorage).
      const saved = addToHistory(text.trim(), data);
      setSelectedId(saved.id);
    } catch {
      // fetch() itself failed: offline, server down, or a non-JSON reply.
      setError(
        "Could not reach the server. Please check your connection and try again.",
      );
    } finally {
      // Step 9: always leave the loading state, success or failure.
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:py-16">
      <header className="mb-8 text-center lg:mb-12">
        {/* Gradient text: paint a pink→amber background, clip it to the letters, make the text itself transparent. */}
        <h1 className="bg-linear-to-r from-pink-600 to-amber-500 bg-clip-text pb-1 text-3xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-pink-400 dark:to-amber-300">
          AI Text Analyzer
        </h1>
        <p className="mt-2 text-pink-900/70 dark:text-pink-200/80">
          Get a summary, sentiment, key topics and a suggested reply for any
          text.
        </p>
        <p className="mt-4 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Powered by OpenAI · results are AI-generated and may contain mistakes
        </p>
      </header>

      {/* One column on phones, two columns (input | results) on large screens. */}
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <TextInput
          text={text}
          isLoading={isLoading}
          onTextChange={setText}
          onAnalyze={handleAnalyze}
        />

        {/* Step 10: React shows exactly one of these, based on the state. */}
        <section ref={resultsRef} aria-live="polite" className="scroll-mt-4">
          {isLoading && <LoadingState />}
          {!isLoading && error && <ErrorMessage message={error} />}
          {!isLoading && result && <AnalysisResults result={result} />}
          {!isLoading && !error && !result && (
            <div className="rounded-2xl border-2 border-dashed border-pink-300 bg-white/60 p-10 text-center text-sm text-pink-500 dark:border-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
              Your analysis will appear here.
            </div>
          )}
        </section>
      </div>

      {/* NEW: the last five saved analyses, full width under the input and results. */}
      <RecentAnalyses
        items={history}
        selectedId={selectedId}
        disabled={isLoading}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onClear={handleClearHistory}
      />
    </main>
  );
}
