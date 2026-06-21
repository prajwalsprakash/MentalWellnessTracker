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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-100 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <BookOpen className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                Daily Reflection
              </h1>
              <p className="text-xs text-slate-400 sm:text-sm">
                A safe space to process your thoughts. Write freely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* ---- LEFT: Writing area ---- */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-lg backdrop-blur-xl sm:p-6">
              {/* Textarea */}
              <textarea
                id="journal-textarea"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="How was your day? What's on your mind? There are no wrong answers here..."
                className="min-h-[300px] w-full resize-none rounded-xl border-0 bg-transparent p-4 text-base leading-relaxed text-slate-800 outline-none placeholder:text-slate-300 focus:ring-0 sm:min-h-[400px] sm:text-lg"
              />

              {/* Bottom bar */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <p id="journal-word-count" className="text-sm text-slate-400">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </p>

                <button
                  id="journal-analyze-button"
                  type="button"
                  disabled={!journalText.trim() || isAnalyzing}
                  onClick={handleAnalyze}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-400 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm animate-in fade-in duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <p className="font-semibold">Analysis Failed</p>
                  <p className="mt-0.5 text-xs text-rose-500 leading-relaxed">{error}</p>
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
                  <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-lg backdrop-blur-xl">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                      Primary Emotion
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">
                        {emojiFor(analysisResult.primaryEmotion)}
                      </span>
                      <span className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold capitalize text-indigo-600">
                        {analysisResult.primaryEmotion}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stressors */}
                {analysisResult.stressors && Array.isArray(analysisResult.stressors) && analysisResult.stressors.length > 0 && (
                  <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-lg backdrop-blur-xl">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                      Stressors Detected
                    </p>
                    <ul className="space-y-2">
                      {analysisResult.stressors.map((stressor, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                          <span className="text-sm text-slate-600">
                            {stressor}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Insight */}
                {analysisResult.advice && (
                  <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/60 shadow-lg backdrop-blur-xl">
                    <div className="flex gap-3 border-l-4 border-emerald-400 p-5">
                      <Brain className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-600">
                          AI Insight
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {analysisResult.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Past entries */}
            <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-lg backdrop-blur-xl">
              <div className="mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700">
                  Recent Reflections
                </h2>
              </div>
              <div className="space-y-3">
                {pastEntries.map((entry) => (
                  <button
                    key={entry.id}
                    id={`past-entry-${entry.id}`}
                    type="button"
                    className="block w-full rounded-xl border border-slate-100 bg-white/60 p-3.5 text-left transition-all duration-200 hover:scale-[1.01] hover:border-indigo-100 hover:shadow-md"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {entry.date}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-500">
                        {emojiFor(entry.emotion)} {entry.emotion}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {entry.preview}
                    </p>
                  </button>
                ))}
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
