"use client";

import { useState } from "react";
import { Smile, BookOpen, Sparkles, Check, AlertCircle } from "lucide-react";

interface UnifiedLoggerProps {
  onSuccess?: () => void;
  className?: string;
}

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

export default function UnifiedWellnessLogger({ onSuccess, className = "" }: UnifiedLoggerProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
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
    setReflectionText("");
    setIsSubmitted(false);
    setErrorMessage(null);
  }

  async function handleSubmit() {
    if (selectedMood === null && !reflectionText.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Log Mood if selected
      if (selectedMood !== null) {
        const moodRes = await fetch("/api/mood", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            score: selectedMood,
            tags: selectedTags,
          }),
        });
        if (!moodRes.ok) throw new Error("Failed to save your mood check-in.");
      }

      // 2. Save and analyze journal if text is written
      if (reflectionText.trim()) {
        const journalRes = await fetch("/api/journal/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: reflectionText,
          }),
        });
        if (!journalRes.ok) throw new Error("Failed to analyze your reflection.");
      }

      setIsSubmitted(true);
      onSuccess?.();

      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      id="unified-logger-card"
      className={`rounded-xl bg-surface-container border border-outline p-6 shadow-card flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
          <Smile className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            Daily Check-In &amp; Reflection
          </h3>
          <p className="text-xs text-on-surface-variant font-medium">
            Log your mood and write a quick reflection to reveal AI insights
          </p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-500 flex-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="mt-3 text-sm font-bold text-foreground">Check-in logged successfully!</p>
          <p className="mt-1 text-xs text-on-surface-variant font-medium">Your dashboard is updating... 💚</p>
        </div>
      ) : (
        <div className="space-y-5 flex-1 flex flex-col justify-between">
          {/* Emojis */}
          <div className="flex items-center justify-between px-2 py-1 bg-surface-container-low rounded-2xl p-2">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.score;
              return (
                <button
                  key={mood.score}
                  type="button"
                  onClick={() => setSelectedMood(mood.score)}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 transition-md active-tactile ${
                    isSelected ? "bg-secondary-container text-on-secondary-container scale-105 shadow-sm font-bold" : "hover:bg-surface-container/60 text-on-surface-variant"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                  <span className={`text-[10px] font-semibold ${isSelected ? "text-on-secondary-container" : "text-on-surface-variant/80"}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-bold text-on-surface-variant mb-2">How are you managing exam stress?</p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-md active-tactile ${
                      isActive
                        ? "bg-secondary-container text-on-secondary-container font-bold"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-outline/10"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reflection text */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
              <BookOpen className="w-4 h-4 text-primary" />
              Mindful Journaling (Optional)
            </label>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What study goals or stresses are on your mind? Spill your thoughts..."
              rows={3}
              className="w-full resize-none rounded-2xl border border-outline/10 bg-surface-container-low p-4 text-sm leading-relaxed text-foreground placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700 font-semibold shadow-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedMood === null && !reflectionText.trim()}
            className="md-btn-filled w-full flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? "Saving Check-In…" : "Log & Reflect"}
          </button>
        </div>
      )}
    </div>
  );
}
