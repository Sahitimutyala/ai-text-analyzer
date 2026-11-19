// Shown while we wait for /api/analyze to answer.
// role="status" tells screen readers to announce "Analyzing your text…".

export default function LoadingState() {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-pink-200 bg-white p-10 text-pink-600 dark:border-pink-800 dark:bg-pink-900 dark:text-pink-300"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      <p className="text-sm font-medium">Analyzing your text…</p>
    </div>
  );
}
