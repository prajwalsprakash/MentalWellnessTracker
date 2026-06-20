"use client";

import { useState } from "react";
import { GraduationCap, Calendar, ArrowRight, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: { targetExam: string; targetDate: string }) => void;
}

const POPULAR_EXAMS = [
  "NEET UG",
  "GATE",
  "UPSC CSE",
  "JEE Main",
  "CUET",
  "CAT",
  "Other",
];

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [targetExam, setTargetExam] = useState("");
  const [customExam, setCustomExam] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const selectedExam = targetExam === "Other" ? customExam : targetExam;

  const handleSubmit = async () => {
    if (!selectedExam || !targetDate) return;
    setIsSubmitting(true);

    try {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetExam: selectedExam, targetDate }),
      });
      onComplete({ targetExam: selectedExam, targetDate });
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome onboarding"
      >
        {/* Decorative top gradient */}
        <div className="h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)]" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
              <Sparkles className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Welcome to The Mindful Aspirant
            </h2>
            <p className="text-[var(--muted-foreground)] mt-2">
              Let&apos;s personalize your experience
            </p>
          </div>

          {step === 1 ? (
            /* Step 1: Select Exam */
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mb-4">
                <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
                Which exam are you preparing for?
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {POPULAR_EXAMS.map((exam) => (
                  <button
                    key={exam}
                    id={`exam-${exam.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setTargetExam(exam)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      targetExam === exam
                        ? "border-[var(--primary)] bg-indigo-50 text-[var(--primary)] ring-2 ring-indigo-200"
                        : "border-[var(--border)] text-[var(--foreground)] hover:border-indigo-200 hover:bg-indigo-50/50"
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>

              {targetExam === "Other" && (
                <input
                  type="text"
                  placeholder="Enter your exam name"
                  value={customExam}
                  onChange={(e) => setCustomExam(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-[var(--primary)] mb-4"
                />
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!selectedExam}
                id="onboarding-next"
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Step 2: Select Date */
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] mb-4">
                <Calendar className="w-4 h-4 text-[var(--primary)]" />
                When is your {selectedExam} exam?
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                id="onboarding-date"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-[var(--primary)] mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3.5 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-slate-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!targetDate || isSubmitting}
                  id="onboarding-complete"
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Let&apos;s Begin
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div
              className={`w-8 h-1.5 rounded-full transition-all ${
                step === 1 ? "bg-[var(--primary)]" : "bg-slate-200"
              }`}
            />
            <div
              className={`w-8 h-1.5 rounded-full transition-all ${
                step === 2 ? "bg-[var(--primary)]" : "bg-slate-200"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
