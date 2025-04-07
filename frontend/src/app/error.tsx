'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
      <button
        onClick={reset}
        className="bg-sky-900 text-white px-4 py-2 rounded-full hover:bg-sky-800 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
