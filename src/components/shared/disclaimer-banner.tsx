'use client';

import { Shield, AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  variant?: 'subtle' | 'prominent';
}

const DISCLAIMER_TEXT =
  'The Mindful Aspirant is a peer support tool designed for exam preparation stress management. ' +
  'It is not a substitute for professional mental health advice, diagnosis, or treatment.';

export default function DisclaimerBanner({
  variant = 'subtle',
}: DisclaimerBannerProps) {
  if (variant === 'prominent') {
    return (
      <div
        id="disclaimer-banner-prominent"
        className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:px-5 sm:py-4"
        role="alert"
      >
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-xs leading-relaxed text-amber-800 sm:text-sm">
          {DISCLAIMER_TEXT}
        </p>
      </div>
    );
  }

  return (
    <div
      id="disclaimer-banner-subtle"
      className="flex items-center gap-2 px-1"
      role="note"
    >
      <Shield className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <p className="text-[11px] leading-relaxed text-slate-400 sm:text-xs">
        {DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
