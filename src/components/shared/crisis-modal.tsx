'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Heart, Phone, X } from 'lucide-react';
import { CRISIS_HELPLINES } from '@/lib/crisis-detection';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisModal({ isOpen, onClose }: CrisisModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  /* ---- Focus trap ---- */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose) {
        onClose();
        return;
      }

      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusableEls = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusableEls.length === 0) return;

      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [canClose, onClose],
  );

  /* ---- Lifecycle ---- */
  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
      setCountdown(5);
      setCanClose(false);
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement;
    // Small delay so the CSS transition plays
    const showTimer = setTimeout(() => setIsVisible(true), 20);

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(showTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  /* ---- Countdown timer ---- */
  useEffect(() => {
    if (!isOpen || canClose) return;

    if (countdown <= 0) {
      setCanClose(true);
      // Auto-focus the close button when it appears
      setTimeout(() => closeButtonRef.current?.focus(), 100);
      return;
    }

    const tick = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(tick);
  }, [isOpen, countdown, canClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-heading"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`relative z-10 w-full max-w-lg transform overflow-y-auto rounded-3xl bg-[var(--surface-container)] border border-[var(--outline)]/15 p-6 shadow-2xl transition-all duration-300 sm:p-8 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Pulsing heart */}
        <div className="mb-5 flex justify-center">
          <div className="animate-pulse rounded-full bg-rose-500/10 p-4">
            <Heart
              className="h-10 w-10 text-rose-500"
              fill="currentColor"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Heading */}
        <h2
          id="crisis-modal-heading"
          className="mb-2 text-center text-2xl font-bold text-[var(--foreground)]"
        >
          We Care About You
        </h2>
        <p className="mb-6 text-center text-sm leading-relaxed text-[var(--on-surface-variant)]">
          You&apos;re not alone. What you&apos;re feeling matters, and there are
          people who want to help.
        </p>

        {/* Divider */}
        <div className="mb-5 h-px bg-gradient-to-r from-transparent via-[var(--outline)]/20 to-transparent" />

        {/* Helpline heading */}
        <h3 className="mb-4 text-center text-sm font-semibold text-[var(--foreground)]/80">
          Reach Out Now — Confidential Helplines
        </h3>

        {/* Helpline cards */}
        <div className="mb-6 space-y-2.5">
          {CRISIS_HELPLINES.map((helpline) => (
            <a
              key={helpline.number}
              href={`tel:${helpline.number.replace(/[^0-9+]/g, '')}`}
              id={`crisis-helpline-${helpline.number.replace(/[^0-9]/g, '')}`}
              className="flex items-center gap-3 rounded-xl border border-[var(--outline)]/10 bg-[var(--surface-container-low)]/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-[var(--secondary-container)]/30 hover:shadow-md"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10">
                <Phone className="h-4 w-4 text-rose-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  <span className="mr-1.5">{helpline.flag}</span>
                  {helpline.name}
                </p>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  {helpline.number}
                  <span className="mx-1.5 text-[var(--outline)]/30">•</span>
                  {helpline.available}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* Strength message */}
        <p className="mb-5 text-center text-xs leading-relaxed text-[var(--on-surface-variant)]">
          Remember: Seeking help is a sign of strength, not weakness. 💛
        </p>

        {/* Close / Countdown */}
        <div className="flex justify-center">
          {canClose ? (
            <button
              ref={closeButtonRef}
              id="crisis-modal-close-button"
              type="button"
              onClick={onClose}
              className="md-btn-tonal flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              I understand, close this message
            </button>
          ) : (
            <p className="text-xs text-[var(--on-surface-variant)]/75">
              This message will be dismissable in{' '}
              <span className="font-semibold text-rose-500">{countdown}</span>s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
