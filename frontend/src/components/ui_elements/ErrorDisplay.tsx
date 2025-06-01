import { useRouter } from "next/navigation";

interface ErrorDisplayProps {
  error?: string | Error | null;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showRetryButton?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  error,
  title = "Oops! Something went wrong",
  description = "We couldn't load the content you're looking for. This might be a temporary issue.",
  showBackButton = true,
  showRetryButton = true,
  onRetry,
  className = "",
}: ErrorDisplayProps) {
  const router = useRouter();
  const errorMessage =
    error instanceof Error
      ? error.message
      : error || "An unexpected error occurred";

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 ${className}`}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 hover:scale-105">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
          {title}
        </h2>

        {/* Error Message */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
          <p className="text-red-700 text-center font-medium">{errorMessage}</p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-center mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showBackButton && (
            <button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-200"
              onClick={() => router.back()}
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Go Back
              </span>
            </button>
          )}

          {showRetryButton && (
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
              onClick={handleRetry}
            >
              <span className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Try Again
              </span>
            </button>
          )}
        </div>

        {/* Help Link */}
        <div className="mt-6 text-center">
          <a
            href="#"
            className="text-sm text-gray-500 hover:text-teal-600 transition-colors duration-200"
          >
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
