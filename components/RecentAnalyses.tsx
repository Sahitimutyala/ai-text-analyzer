// The "Recent Analyses" section: the last five saved analyses.
// Like the other components, it only displays data and reports clicks to the
// parent (page.tsx). It doesn't read or write localStorage itself.
//
// The search box, sentiment filter and sort order are "view" state: they only
// change what is SHOWN. They live here, and the saved list (`items`) is never changed.

import { useState } from "react";
import type { HistoryItem } from "@/lib/history";
import { MAX_HISTORY } from "@/lib/history";
import {
  DEFAULT_VIEW,
  filterAndSortHistory,
  type HistoryView,
  type SentimentFilter,
  type SortOrder,
} from "@/lib/historyFilters";
import SentimentBadge from "./SentimentBadge";

const FILTERS: SentimentFilter[] = ["All", "Positive", "Negative", "Neutral"];

interface RecentAnalysesProps {
  items: HistoryItem[];
  selectedId: string | null; // the item currently shown in the results section
  disabled: boolean; // true while a new analysis is running
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

/** "26 Nov 2026, 14:05", in the user's own language and time zone. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function RecentAnalyses({
  items,
  selectedId,
  disabled,
  onSelect,
  onDelete,
  onClear,
}: RecentAnalysesProps) {
  const [view, setView] = useState<HistoryView>(DEFAULT_VIEW);
  const update = (change: Partial<HistoryView>) => setView((v) => ({ ...v, ...change }));

  // Recalculated on every render from the saved list + the current choices.
  // Search, filter and sort all apply together.
  const visible = filterAndSortHistory(items, view);

  return (
    <section
      aria-labelledby="recent-analyses-heading"
      className="mt-8 rounded-2xl border border-pink-200 bg-white p-5 shadow-sm dark:border-pink-800 dark:bg-pink-900"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2
            id="recent-analyses-heading"
            className="text-sm font-semibold text-pink-700 dark:text-pink-200"
          >
            Recent Analyses
          </h2>
          <p className="text-xs text-pink-900/60 dark:text-pink-200/70">
            The last {MAX_HISTORY} are saved in this browser only. Click one to view it again
            without calling the AI.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50 dark:text-rose-300 dark:hover:bg-pink-800"
          >
            Clear history
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className="mb-4 flex flex-col gap-3">
          {/* Search + sort: stacked on phones, side by side from "sm" up. */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="history-search" className="sr-only">
              Search saved analyses
            </label>
            <input
              id="history-search"
              type="search"
              value={view.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder="Search text or summary…"
              className="min-w-0 flex-1 rounded-xl border border-pink-300 bg-pink-50 px-3 py-2 text-sm text-pink-800 outline-none transition placeholder:text-pink-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-100 dark:focus:ring-amber-900"
            />
            <label htmlFor="history-sort" className="sr-only">
              Sort saved analyses
            </label>
            <select
              id="history-sort"
              value={view.sort}
              onChange={(e) => update({ sort: e.target.value as SortOrder })}
              className="rounded-xl border border-pink-300 bg-pink-50 px-3 py-2 text-sm text-pink-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-100 dark:focus:ring-amber-900"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Sentiment filter: one pill per option; aria-pressed tells screen readers which is on. */}
          <div role="group" aria-label="Filter by sentiment" className="flex flex-wrap gap-2">
            {FILTERS.map((option) => {
              const active = view.sentiment === option;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ sentiment: option })}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-500"
                      : "border-pink-200 bg-white text-pink-700 hover:border-pink-400 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-200"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-pink-900/60 dark:text-pink-200/70" aria-live="polite">
            Showing {visible.length} of {items.length}
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-pink-200 p-6 text-center text-sm text-pink-500 dark:border-pink-700 dark:text-pink-300">
          No saved analyses yet. Your results will appear here after you analyze some text.
        </p>
      ) : visible.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-pink-200 p-6 text-center text-sm text-pink-500 dark:border-pink-700 dark:text-pink-300">
          <p>No saved analyses match your search or filter.</p>
          {/* Nothing matches, so a search or filter must be active: offer a reset. */}
          <button
            type="button"
            onClick={() => update({ query: "", sentiment: "All" })}
            className="mt-2 rounded-lg px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-pink-800"
          >
            Show all
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <li
                key={item.id}
                className={`flex items-start gap-2 rounded-xl border p-1 transition ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 dark:border-amber-500 dark:bg-pink-950"
                    : "border-pink-100 bg-pink-50/50 hover:border-pink-300 dark:border-pink-800 dark:bg-pink-950/40"
                }`}
              >
                {/* The main area is one big button: clicking it opens this analysis. */}
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  disabled={disabled}
                  aria-current={isSelected ? "true" : undefined}
                  className="min-w-0 flex-1 rounded-lg p-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <SentimentBadge sentiment={item.result.sentiment} size="sm" />
                    <time
                      dateTime={item.analyzedAt}
                      className="text-xs text-pink-900/60 dark:text-pink-200/70"
                    >
                      {formatDate(item.analyzedAt)}
                    </time>
                  </div>
                  {/* line-clamp-2: show at most two lines of the original text, then "…" */}
                  <p className="line-clamp-2 break-words text-sm text-pink-900 dark:text-pink-100">
                    {item.text}
                  </p>
                </button>

                {/* A separate, smaller button for deleting just this item. */}
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  disabled={disabled}
                  aria-label={`Delete analysis from ${formatDate(item.analyzedAt)}`}
                  title="Delete"
                  className="shrink-0 rounded-lg p-2 text-pink-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:text-pink-300 dark:hover:bg-pink-800"
                >
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
