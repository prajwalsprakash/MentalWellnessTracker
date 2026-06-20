"use client";

import { useState } from "react";
import { Smile, BookOpen, Sparkles, Check, AlertCircle } from "lucide-react";

interface UnifiedLoggerProps {
  onSuccess?: () => void;
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

export default function UnifiedWellnessLogger({ onSuccess }: UnifiedLoggerProps) {
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
      className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-shadow duration-300 hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
          <Smile className="h-5 w-5 text-indigo-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Daily Check-In &amp; Reflection
          </h3>
          <p className="text-xs text-slate-400">
            Log your mood and write a quick reflection to reveal AI insights
          </p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">Check-in logged successfully!</p>
          <p className="mt-1 text-xs text-slate-400">Your dashboard is updating... 💚</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Emojis */}
          <div className="flex items-center justify-between px-2 py-1">
            {moods.map((mood) => {
              const isSelected = selectedMood === mood.score;
              return (
                <button
                  key={mood.score}
                  type="button"
                  onClick={() => setSelectedMood(mood.score)}
                  className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-200 ${
                    isSelected ? "bg-indigo-50/70 ring-1 ring-indigo-300 scale-105" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{mood.emoji}</span>
                  <span className={`text-[10px] font-medium ${isSelected ? "text-indigo-600" : "text-slate-400"}`}>
                    {mood.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">How are you managing exam stress?</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => {
                const isActive = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
                        : "bg-slate-100/80 text-slate-500 hover:bg-slate-200"
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
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <BookOpen className="w-3.5 h-3.5" />
              Mindful Journaling (Optional)
            </label>
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What study goals or stresses are on your mind? Spill your thoughts..."
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200/80 bg-white/40 p-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            />
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selectedMood === null && !reflectionText.trim()}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-400 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? "Saving Check-In…" : "Log & Reflect"}
          </button>
        </div>
      )}
    </div>
  );
}
