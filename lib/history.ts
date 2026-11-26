// Analysis history, saved in the browser's localStorage.
//
// localStorage is a small key → text store built into every browser. It's saved
// on the user's computer (per website), survives refreshes and browser restarts,
// and is never sent to our server. It can only store TEXT, so we convert our
// list to a JSON string when saving (JSON.stringify) and back when reading
// (JSON.parse).
//
// Everything here runs in the BROWSER only. The server has no localStorage, and
// it never sees the history.

import { useSyncExternalStore } from "react";
import type { AnalysisResult, Sentiment } from "./types";

/** One saved analysis: the original text, the AI's result, and when it ran. */
export interface HistoryItem {
  id: string; // unique id, used for delete and for highlighting the open item
  text: string; // the original input text
  result: AnalysisResult; // summary, sentiment, topics, suggestedResponse
  analyzedAt: string; // date and time, as an ISO string, e.g. "2026-11-26T14:05:00.000Z"
}

const STORAGE_KEY = "ai-text-analyzer:history"; // the "name" our data is saved under
export const MAX_HISTORY = 5; // keep only the five most recent analyses

const EMPTY: HistoryItem[] = []; // one shared empty list (React needs a stable value)

// ─── Reading ───────────────────────────────────────────────────────────────

/** Read the raw saved text. Returns null if nothing is saved or storage is blocked. */
function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // e.g. some private-browsing modes block storage
  }
}

const SENTIMENTS: Sentiment[] = ["Positive", "Negative", "Neutral"];

/** Check that something loaded from storage really looks like a HistoryItem. */
function isHistoryItem(value: unknown): value is HistoryItem {
  const v = value as HistoryItem;
  return (
    typeof v === "object" && v !== null &&
    typeof v.id === "string" &&
    typeof v.text === "string" &&
    typeof v.analyzedAt === "string" &&
    typeof v.result === "object" && v.result !== null &&
    typeof v.result.summary === "string" &&
    SENTIMENTS.includes(v.result.sentiment) &&
    Array.isArray(v.result.topics) &&
    typeof v.result.suggestedResponse === "string"
  );
}

/** Turn the saved text back into a list. Bad or edited data is ignored, never a crash. */
function parse(raw: string | null): HistoryItem[] {
  if (!raw) return EMPTY;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return EMPTY;
    return data.filter(isHistoryItem).slice(0, MAX_HISTORY);
  } catch {
    return EMPTY; // not valid JSON (for example, edited by hand)
  }
}

// React may ask for the history many times per render, so only re-parse the
// JSON when the saved text has actually changed.
let cachedRaw: string | null = null;
let cachedItems: HistoryItem[] = EMPTY;

function getSnapshot(): HistoryItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

// On the server (and during the first render in the browser) there is no
// localStorage, so the history starts empty and fills in right after the page loads.
function getServerSnapshot(): HistoryItem[] {
  return EMPTY;
}

// ─── Telling React when the history changes ────────────────────────────────

const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  // The "storage" event fires when ANOTHER tab of this site changes localStorage,
  // so the history also stays in sync across open tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * React hook: the current history list, newest first.
 * The component re-renders automatically whenever the history changes.
 */
export function useHistory(): HistoryItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ─── Writing ───────────────────────────────────────────────────────────────

function write(items: HistoryItem[]): void {
  try {
    if (items.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    // Storage full or blocked: the app keeps working, history just isn't saved.
    console.warn("Could not save analysis history:", err);
  }
  listeners.forEach((notify) => notify()); // tell React to re-read
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Save a successful analysis at the top of the history.
 * If the same text was analyzed before, the older copy is replaced.
 * Only the newest MAX_HISTORY items are kept.
 */
export function addToHistory(text: string, result: AnalysisResult): HistoryItem {
  const item: HistoryItem = {
    id: makeId(),
    text,
    result,
    analyzedAt: new Date().toISOString(),
  };
  const others = getSnapshot().filter((h) => h.text !== text);
  write([item, ...others].slice(0, MAX_HISTORY));
  return item;
}

/** Remove one saved analysis. */
export function deleteFromHistory(id: string): void {
  write(getSnapshot().filter((h) => h.id !== id));
}

/** Remove all saved analyses. */
export function clearHistory(): void {
  write([]);
}
