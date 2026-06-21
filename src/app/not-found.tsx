import Link from "next/link";
import { HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="glass max-w-md rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
          <HelpCircle className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-slate-800">
          Page Not Found
        </h2>
        <p className="mb-6 text-sm text-slate-500 leading-relaxed">
          We couldn't find the page you're looking for. Make sure the URL is correct or go back to safety.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-6 py-2.5 text-sm font-medium text-white transition-smooth hover:bg-indigo-600 cursor-pointer"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
