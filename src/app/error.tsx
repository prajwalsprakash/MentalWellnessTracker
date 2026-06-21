"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="glass max-w-md rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-slate-800">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-slate-500 leading-relaxed">
          An unexpected error occurred while loading this page. Take a deep breath — we can try reloading it.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-smooth hover:bg-indigo-600 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-xl bg-white border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-smooth hover:bg-slate-100 cursor-pointer"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
