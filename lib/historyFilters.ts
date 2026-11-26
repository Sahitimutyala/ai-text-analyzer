// Search, sentiment filter and sort for the Recent Analyses list.
//
// This is a PURE function: it takes the saved list and the user's choices, and
// returns a NEW list to display. It never changes the original array and never
// touches localStorage, so searching or filtering can't modify or delete the
// saved history. It also never calls the AI. It just works on data we already have.

import type { HistoryItem } from "./history";
import type { Sentiment } from "./types";

export type SentimentFilter = Sentiment | "All";
export type SortOrder = "newest" | "oldest";

export interface HistoryView {
  query: string; // what the user typed in the search box
  sentiment: SentimentFilter; // "All" = no filter
  sort: SortOrder;
}

export const DEFAULT_VIEW: HistoryView = { query: "", sentiment: "All", sort: "newest" };

export function filterAndSortHistory(items: HistoryItem[], view: HistoryView): HistoryItem[] {
  const query = view.query.trim().toLowerCase();

  // 1. Search: keep items whose original text OR summary contains the query (any case).
  // 2. Filter: keep items with the chosen sentiment (or all of them).
  // .filter() always returns a new array, so `items` itself is untouched.
  const matches = items.filter((item) => {
    const matchesQuery =
      query === "" ||
      item.text.toLowerCase().includes(query) ||
      item.result.summary.toLowerCase().includes(query);
    const matchesSentiment = view.sentiment === "All" || item.result.sentiment === view.sentiment;
    return matchesQuery && matchesSentiment;
  });

  // 3. Sort by the saved date. .sort() changes the array it's called on, which
  //    is why we sort `matches` (our own copy) and never `items`.
  const direction = view.sort === "newest" ? -1 : 1;
  return matches.sort((a, b) => direction * (Date.parse(a.analyzedAt) - Date.parse(b.analyzedAt)));
}
