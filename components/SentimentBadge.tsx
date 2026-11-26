// A coloured pill for the sentiment. Using a Record<Sentiment, ...> means that
// if we ever add a new sentiment to lib/types.ts, TypeScript forces us to give
// it a style here too.

import type { Sentiment } from "@/lib/types";

const STYLES: Record<Sentiment, { className: string; emoji: string }> = {
  Positive: {
    className:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    emoji: "😊",
  },
  Negative: {
    className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    emoji: "😟",
  },
  Neutral: {
    className: "bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200",
    emoji: "😐",
  },
};

// "md" is the original size (used in the results card); "sm" is a compact
// version for the Recent Analyses list.
const SIZES = {
  md: "gap-1.5 px-3 py-1 text-sm",
  sm: "gap-1 px-2 py-0.5 text-xs",
};

export default function SentimentBadge({
  sentiment,
  size = "md",
}: {
  sentiment: Sentiment;
  size?: keyof typeof SIZES;
}) {
  const style = STYLES[sentiment];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${SIZES[size]} ${style.className}`}
    >
      <span aria-hidden="true">{style.emoji}</span>
      {sentiment}
    </span>
  );
}
