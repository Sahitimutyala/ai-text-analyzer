// The analysis logic. THIS IS THE ONLY FILE THAT CHANGES when we switch from
// mock data to the real Claude API. Everything else (UI, API route) stays the same,
// because they only depend on the function signature below:
//
//     analyzeText(text: string): Promise<AnalysisResult>
//
// For now (Phase 2) it returns realistic *mock* data. No paid API is called.

import type { AnalysisResult, Sentiment } from "./types";

const FAKE_DELAY_MS = 1500; // pretend the AI takes ~1.5 seconds to think

// Tiny keyword lists, just so different inputs give different sentiments.
// A real AI understands context; this is only a stand-in.
const POSITIVE_WORDS = [
  "love", "great", "amazing", "excellent", "happy", "good", "fantastic",
  "wonderful", "thanks", "thank", "awesome", "pleased", "recommend",
];
const NEGATIVE_WORDS = [
  "hate", "terrible", "awful", "bad", "angry", "late", "broken", "damaged",
  "disappointed", "worst", "refund", "problem", "poor", "unhappy",
];

// Common words we skip when guessing "topics".
const STOP_WORDS = new Set([
  "the", "and", "for", "that", "this", "with", "was", "are", "but", "have",
  "has", "had", "you", "your", "our", "not", "from", "they", "them", "were",
  "been", "will", "would", "could", "should", "about", "what", "when", "which",
  "there", "their", "just", "very", "really", "also", "into", "than", "then",
  "it's", "i'm", "its", "can", "did", "does", "all", "any", "out", "too",
]);

/** Count positive vs. negative keywords to pick a sentiment. */
function detectSentiment(words: string[]): Sentiment {
  const positive = words.filter((w) => POSITIVE_WORDS.includes(w)).length;
  const negative = words.filter((w) => NEGATIVE_WORDS.includes(w)).length;
  if (positive > negative) return "Positive";
  if (negative > positive) return "Negative";
  return "Neutral";
}

/** Pick the most frequent "meaningful" words as pretend topics. */
function detectTopics(words: string[]): string[] {
  const counts = new Map<string, number>();
  for (const w of words) {
    if (w.length < 4 || STOP_WORDS.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const topics = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  return topics.length > 0 ? topics : ["General"];
}

/** Use the first sentence (shortened) as a pretend summary. */
function makeSummary(text: string): string {
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0].trim();
  const short =
    firstSentence.length > 160 ? firstSentence.slice(0, 157) + "…" : firstSentence;
  return `(Mock summary) The text is mainly about: "${short}"`;
}

const SUGGESTED_RESPONSES: Record<Sentiment, string> = {
  Positive:
    "Thank you so much for your kind words! We're really glad to hear about your experience and look forward to helping you again.",
  Negative:
    "We're sorry to hear about this experience. We understand your frustration and would like to make it right. Could you share a few more details so we can help?",
  Neutral:
    "Thanks for reaching out. We've noted your message. Please let us know if there's anything specific we can help you with.",
};

export async function analyzeText(text: string): Promise<AnalysisResult> {
  // Simulate network + AI thinking time, so the loading state is visible.
  await new Promise((resolve) => setTimeout(resolve, FAKE_DELAY_MS));

  // Split into lowercase words, removing punctuation.
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const sentiment = detectSentiment(words);

  return {
    summary: makeSummary(text),
    sentiment,
    topics: detectTopics(words),
    suggestedResponse: SUGGESTED_RESPONSES[sentiment],
  };
}
