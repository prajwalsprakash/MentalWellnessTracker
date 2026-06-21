'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Loader2, Calendar, Brain, AlertCircle } from 'lucide-react';
import CrisisModal from '@/components/shared/crisis-modal';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AnalysisResult {
  primaryEmotion: string;
  stressors: string[];
  advice: string;
  isCrisis: boolean;
}

interface PastEntry {
  id: string;
  date: string;
  emotion: string;
  preview: string;
}

/* ------------------------------------------------------------------ */
/*  Emotion → emoji map                                                */
/* ------------------------------------------------------------------ */

const EMOTION_EMOJI: Record<string, string> = {
  anxious: '😰',
  sad: '😢',
  happy: '😊',
  stressed: '😤',
  calm: '😌',
  frustrated: '😤',
  neutral: '😐',
  hopeful: '🌤️',
  overwhelmed: '😩',
  tired: '😴',
};

function emojiFor(emotion?: string): string {
  if (!emotion) return '😐';
  return EMOTION_EMOJI[emotion.toLowerCase()] ?? '😐';
}

/* ------------------------------------------------------------------ */
/*  Mock past entries                                                  */
/* ------------------------------------------------------------------ */

const MOCK_PAST_ENTRIES: PastEntry[] = [
  {
    id: 'pe-1',
    date: '18 Jun 2026',
    emotion: 'anxious',
    preview:
      'Two days left before the physics paper and I still can\'t wrap my head around thermodynamics. Spent the whole evening revising but nothing seems to stick…',
  },
  {
    id: 'pe-2',
    date: '16 Jun 2026',
    emotion: 'stressed',
    preview:
      'Mock test results came out today. I scored well in maths but chemistry was a disaster. Everyone around me seems so much more prepared…',
  },
  {
    id: 'pe-3',
    date: '14 Jun 2026',
    emotion: 'calm',
    preview:
      'Took a break today and went for a walk. It felt good to step away from the books. Reminded myself that one bad day doesn\'t define my future.',
  },
  {
    id: 'pe-4',
    date: '12 Jun 2026',
    emotion: 'frustrated',
    preview:
      'I keep making silly mistakes in the practice papers. My parents expect me to get into a top college and the pressure is making it hard to focus…',
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function JournalPage() {
  const [journalText, setJournalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pastEntries, setPastEntries] = useState<PastEntry[]>([]);

  function formatDate(dateString: string): string {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Today';
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Today';
    }
  }

  // Load past entries on mount
  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch('/api/journal');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.entries.map((e: any) => ({
            id: e.id,
            date: formatDate(e.createdAt),
            emotion: e.primaryEmotion,
            preview: e.text,
          }));
          setPastEntries(mapped);
        }
      } catch (err) {
        console.error('Failed to load past reflections:', err);
      }
    }
    loadEntries();
  }, []);

  const wordCount = journalText.trim()
    ? journalText.trim().split(/\s+/).length
    : 0;

  async function handleAnalyze() {
    if (!journalText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setShowResults(false);
    setError(null);

    const originalText = journalText;

    try {
      const res = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: originalText }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze journal entry.');
      }

      const data: AnalysisResult & { id?: string } = await res.json();
      setAnalysisResult(data);

      if (data.isCrisis) {
        setCrisisTriggered(true);
      }

      // Add to past reflections immediately
      const newEntry: PastEntry = {
        id: data.id || `temp-${Date.now()}`,
        date: formatDate(new Date().toISOString()),
        emotion: data.primaryEmotion,
        preview: originalText,
      };
      setPastEntries((prev) => [newEntry, ...prev]);

      // Clear textarea after successful reflection
      setJournalText('');

      // Trigger fade-in
      requestAnimationFrame(() => setShowResults(true));
    } catch (err: any) {
      console.error('Error analyzing journal entry:', err);
      setError(err.message || 'Failed to analyze your reflection. Please check your database connection.');
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border border-outline/10 bg-surface-container/60 backdrop-blur-lg rounded-[24px] mb-6 shadow-card-static">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Daily Reflection
              </h1>
              <p className="text-xs text-on-surface-variant sm:text-sm font-medium">
                A safe space to process your thoughts. Write freely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-2 py-2">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* ---- LEFT: Writing area ---- */}
          <div className="lg:col-span-3">
            <div className="rounded-[24px] bg-surface-container p-6 border border-outline/5 shadow-card">
              {/* Textarea */}
              <textarea
                id="journal-textarea"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="How was your day? What's on your mind? There are no wrong answers here..."
                className="min-h-[300px] w-full resize-none rounded-2xl border-0 bg-surface-container-low p-5 text-base leading-relaxed text-foreground outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 sm:min-h-[400px] sm:text-lg"
              />

              {/* Bottom bar */}
              <div className="flex items-center justify-between border-t border-outline/10 pt-4 mt-4">
                <p id="journal-word-count" className="text-sm font-medium text-on-surface-variant">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </p>

                <button
                  id="journal-analyze-button"
                  type="button"
                  disabled={!journalText.trim() || isAnalyzing}
                  onClick={handleAnalyze}
                  className="md-btn-filled inline-flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Reflect &amp; Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ---- RIGHT: Analysis + Past Entries ---- */}
          <div className="space-y-6 lg:col-span-2">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 rounded-[24px] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm animate-in fade-in duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-bold">Analysis Failed</p>
                  <p className="mt-0.5 text-xs text-rose-600 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Analysis results */}
            {analysisResult && (
              <div
                id="journal-analysis-results"
                className={`space-y-5 transition-all duration-500 ${
                  showResults
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0'
                }`}
              >
                {/* Primary emotion badge */}
                {analysisResult.primaryEmotion && (
                  <div className="rounded-[24px] bg-surface-container p-6 border border-outline/5 shadow-card">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Primary Emotion
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">
                        {emojiFor(analysisResult.primaryEmotion)}
                      </span>
                      <span className="rounded-full bg-secondary-container px-4 py-1.5 text-sm font-semibold capitalize text-on-secondary-container">
                        {analysisResult.primaryEmotion}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stressors */}
                {analysisResult.stressors && Array.isArray(analysisResult.stressors) && analysisResult.stressors.length > 0 && (
                  <div className="rounded-[24px] bg-surface-container p-6 border border-outline/5 shadow-card">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Stressors Detected
                    </p>
                    <ul className="space-y-2.5">
                      {analysisResult.stressors.map((stressor, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-tertiary" />
                          <span className="text-sm font-medium text-foreground">
                            {stressor}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Insight */}
                {analysisResult.advice && (
                  <div className="overflow-hidden rounded-[24px] border border-[var(--primary)]/15 bg-[var(--secondary-container)]/30 shadow-card">
                    <div className="flex gap-3 border-l-4 border-[var(--primary)] p-5">
                      <Brain className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                          AI Insight
                        </p>
                        <p className="text-sm leading-relaxed text-[var(--foreground)] font-medium">
                          {analysisResult.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Past entries */}
            <div className="rounded-[24px] bg-surface-container p-6 border border-outline/5 shadow-card">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-on-surface-variant" />
                <h2 className="text-sm font-bold text-foreground">
                  Recent Reflections
                </h2>
              </div>
              <div className="space-y-3">
                {pastEntries.length === 0 ? (
                  <p className="text-xs text-on-surface-variant font-medium py-4 text-center">
                    No reflections logged yet. Start typing on the left.
                  </p>
                ) : (
                  pastEntries.map((entry) => (
                    <button
                      key={entry.id}
                      id={`past-entry-${entry.id}`}
                      type="button"
                      className="block w-full rounded-2xl border border-outline/5 bg-surface-container-low p-4 text-left transition-md active-tactile hover:bg-secondary-container/40"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-on-surface-variant">
                          {entry.date}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 text-[11px] font-semibold capitalize text-on-secondary-container">
                          {emojiFor(entry.emotion)} {entry.emotion}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-on-surface-variant font-medium">
                        {entry.preview}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis modal */}
      <CrisisModal
        isOpen={crisisTriggered}
        onClose={() => setCrisisTriggered(false)}
      />
    </div>
  );
}
