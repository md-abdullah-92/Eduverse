"use client";

import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9FAFC] flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="text-6xl font-bold text-emerald-600 mb-2">404</div>
            <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-emerald-100 opacity-20 animate-pulse"></div>
          </div>

          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            Page Not Found
          </h2>

          <p className="text-slate-600 max-w-md mx-auto">
            We couldn&apos;t find the page you&apos;re looking for. It might
            have been moved or deleted.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className={`bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl active:scale-95`}
            >
              Go Home
            </button>

            <button
              onClick={() => window.history.back()}
              className={`bg-white hover:bg-slate-50 text-emerald-600 font-semibold px-6 py-3 rounded-lg border border-emerald-600 transition-colors duration-200 shadow hover:shadow-lg active:scale-95`}
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 text-slate-500">
            <p className="text-sm">
              If you think this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
