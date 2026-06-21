"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global runtime error:", error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="flex h-full flex-col items-center justify-center bg-slate-50 px-6 text-center antialiased">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-800">
            A critical error occurred
          </h2>
          <p className="mb-6 text-sm text-slate-500 leading-relaxed">
            The application encountered a critical issue. We suggest reloading the page.
          </p>
          <button
            onClick={() => reset()}
            className="mx-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-medium text-white transition-smooth hover:bg-indigo-600 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
