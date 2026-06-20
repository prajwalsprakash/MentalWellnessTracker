"use client";

import { useState } from "react";
import { Smile, Check, X } from "lucide-react";

const moods = [
  { score: 1, emoji: "😔", label: "Rough" },
  { score: 2, emoji: "😕", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😊", label: "Great" },
] as const;

const tags = [
  "Anxious",
  "Motivated",
  "Tired",
  "Focused",
  "Overwhelmed",
  "Confident",
  "Sleep-deprived",
  "Energized",
] as const;

interface MoodLoggerProps {
  onSuccess?: () => void;
}

export default function MoodLogger({ onSuccess }: MoodLoggerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function resetForm() {
    setSelectedMood(null);
    setSelectedTags([]);
    setIsSubmitted(false);
    setErrorMessage(null);
  }

  async function handleSubmit() {
    if (selectedMood === null) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: selectedMood,
          tags: selectedTags,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log mood. Please try again.");
      }

      setIsSubmitted(true);
      onSuccess?.();

      // Reset after showing success
      setTimeout(() => {
        resetForm();
      }, 2500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      id="mood-logger-card"
      className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-md backdrop-blur-xl transition-shadow duration-300 hover:shadow-lg"
    >
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
          <Smile className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            How are you feeling right now?
          </h2>
          <p className="text-sm text-slate-400">
            Take a moment to check in with yourself
          </p>
        </div>
      </div>

      {/* Success state */}
      {isSubmitted ? (
        <div
          id="mood-logger-success"
          className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-700">
            Mood logged successfully!
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Thanks for checking in 💚
          </p>
        </div>
      ) : (
        <>
          {/* Emoji selector */}
          <div id="mood-emoji-selector" className="mb-6">
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              {moods.map((mood) => {
                const isSelected = selectedMood === mood.score;
                return (
                  <button
                    key={mood.score}
                    id={`mood-btn-${mood.score}`}
                    type="button"
                    onClick={() => setSelectedMood(mood.score)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 transition-all duration-200 ${
                      isSelected
                        ? "scale-110 ring-2 ring-indigo-400 bg-indigo-50/60"
                        : "hover:scale-105 hover:bg-slate-50"
                    }`}
                    aria-label={`Mood: ${mood.label}`}
                  >
                    <span className="text-3xl sm:text-4xl">{mood.emoji}</span>
                    <span
                      className={`text-xs font-medium ${
                        isSelected ? "text-indigo-600" : "text-slate-400"
                      }`}
                    >
                      {mood.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feeling tags */}
          <div id="mood-tags-section" className="mb-6">
            <p className="mb-3 text-sm font-medium text-slate-500">
              What best describes your state?
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    id={`mood-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              id="mood-logger-error"
              className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600"
            >
              <X className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            id="mood-log-submit"
            type="button"
            onClick={handleSubmit}
            disabled={selectedMood === null || isSubmitting}
            className="w-full rounded-xl bg-indigo-400 px-6 py-3 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:bg-indigo-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-indigo-400 disabled:hover:shadow-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Logging…
              </span>
            ) : (
              "Log Mood"
            )}
          </button>
        </>
      )}
    </div>
  );
}
