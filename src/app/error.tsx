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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="md-card max-w-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100/30 text-rose-500">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h2>
        <p className="mb-6 text-sm text-on-surface-variant leading-relaxed font-medium">
          An unexpected error occurred while loading this page. Take a deep breath — we can try reloading it.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="md-btn-filled text-sm px-6 py-3"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="md-btn-outlined text-sm px-6 py-3 bg-surface-container"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
