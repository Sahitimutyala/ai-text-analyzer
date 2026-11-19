// Displays the four parts of an AnalysisResult as cards.
// It only receives data and shows it. It doesn't know (or care) whether the data
// came from mock code or from a real AI.

import type { ReactNode } from "react";
import type { AnalysisResult } from "@/lib/types";
import SentimentBadge from "./SentimentBadge";

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm dark:border-pink-800 dark:bg-pink-900">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function AnalysisResults({
  result,
}: {
  result: AnalysisResult;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card title="Summary">
        <p className="text-sm leading-relaxed text-pink-800 dark:text-pink-100">
          {result.summary}
        </p>
      </Card>

      <Card title="Sentiment">
        <SentimentBadge sentiment={result.sentiment} />
      </Card>

      <Card title="Main topics">
        <ul className="flex flex-wrap gap-2">
          {result.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            >
              {topic}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Suggested response">
        <p className="whitespace-pre-line text-sm leading-relaxed text-pink-800 dark:text-pink-100">
          {result.suggestedResponse}
        </p>
      </Card>
    </div>
  );
}
