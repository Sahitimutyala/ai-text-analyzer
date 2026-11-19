// A red alert box for any error: empty input, server validation, or server failure.
// role="alert" makes screen readers read it out immediately.

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
    >
      <span className="font-semibold">Error: </span>
      {message}
    </div>
  );
}
