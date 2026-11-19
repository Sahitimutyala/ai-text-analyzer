// The shared "contract" between the frontend and the backend.
// Both app/page.tsx (browser) and app/api/analyze/route.ts (server) import
// these types, so TypeScript warns us if the two sides ever disagree.

export type Sentiment = "Positive" | "Negative" | "Neutral";

/** What a successful analysis looks like (HTTP 200). */
export interface AnalysisResult {
  summary: string; // 1–3 sentences
  sentiment: Sentiment; // exactly one of the three values
  topics: string[]; // 3–5 short topic labels
  suggestedResponse: string; // a reply someone could send back
}

/** What every failure looks like (HTTP 400 or 500). */
export interface ApiError {
  error: string;
}

/** Shared limit, used by both the textarea counter and server validation. */
export const MAX_TEXT_LENGTH = 5000;
