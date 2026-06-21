import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <div className="md-card max-w-md">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h2>
        <p className="mb-6 text-sm text-on-surface-variant leading-relaxed font-medium">
          We couldn't find the page you're looking for. Make sure the URL is correct or go back to safety.
        </p>
        <Link
          href="/dashboard"
          className="md-btn-filled text-sm px-6 py-3"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
