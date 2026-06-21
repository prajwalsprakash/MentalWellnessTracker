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
      <body className="flex h-full flex-col items-center justify-center bg-background px-6 text-center antialiased">
        <div className="md-card max-w-md">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100/30 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
            A critical error occurred
          </h2>
          <p className="mb-6 text-sm text-on-surface-variant leading-relaxed font-medium">
            The application encountered a critical issue. We suggest reloading the page.
          </p>
          <button
            onClick={() => reset()}
            className="md-btn-filled text-sm px-6 py-3"
          >
            <RotateCcw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
