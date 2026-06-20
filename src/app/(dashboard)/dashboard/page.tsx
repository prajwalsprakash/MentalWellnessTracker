"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Sun,
  Moon,
  Sunrise,
  CalendarClock,
  Sparkles,
  Brain,
  Activity,
  Loader2,
} from "lucide-react";
import EmotionalTimeline from "@/components/dashboard/emotional-timeline";
import StressTriggers from "@/components/dashboard/stress-triggers";
import UnifiedWellnessLogger from "@/components/dashboard/unified-logger";
import MiniChat from "@/components/dashboard/mini-chat";
import OnboardingModal from "@/components/shared/onboarding-modal";

// ─────────────────────────────────────────────
// Fallback / Demo Data
// ─────────────────────────────────────────────

const mockMoodData = [
  { day: "Mon", score: 3, date: "2026-06-14" },
  { day: "Tue", score: 4, date: "2026-06-15" },
  { day: "Wed", score: 2, date: "2026-06-16" },
  { day: "Thu", score: 4, date: "2026-06-17" },
  { day: "Fri", score: 3, date: "2026-06-18" },
  { day: "Sat", score: 5, date: "2026-06-19" },
  { day: "Sun", score: 4, date: "2026-06-20" },
];

const mockStressTriggers = [
  { trigger: "Mock exam anxiety", count: 4 },
  { trigger: "Sleep deprivation", count: 3 },
  { trigger: "Syllabus backlog", count: 2 },
  { trigger: "Family pressure", count: 2 },
];

const defaultExam = {
  name: "UPSC CSE Prelims",
  date: new Date("2026-10-04"),
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting(): { text: string; Icon: typeof Sun; message: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      text: "Good Morning",
      Icon: Sunrise,
      message: "A fresh morning is a chance to grow. Plan your study sessions, take a deep breath, and take it one step at a time.",
    };
  }
  if (hour < 17) {
    return {
      text: "Good Afternoon",
      Icon: Sun,
      message: "You've been working hard today. Remember to stretch, stay hydrated, and give yourself a short break. You are making progress!",
    };
  }
  return {
    text: "Good Evening",
    Icon: Moon,
    message: "As the day winds down, take a moment to appreciate your effort. Let go of study stress, relax, and recharge for tomorrow.",
  };
}

function getDaysUntil(target: Date): number {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [examName, setExamName] = useState<string>(defaultExam.name);
  const [examDate, setExamDate] = useState<Date>(defaultExam.date);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // API State
  const [moodLogs, setMoodLogs] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalEntries: 0, avgMood: 0, weeklyLogs: 0 });
  const [latestInsight, setLatestInsight] = useState<any>(null);

  const greeting = getGreeting();
  const GreetingIcon = greeting.Icon;

  // Load all dashboard data
  async function loadDashboardData() {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        setMoodLogs(data.moodData || []);
        setTriggers(data.stressTriggers || []);
        setStats(data.stats || { totalEntries: 0, avgMood: 0, weeklyLogs: 0 });
        setLatestInsight(data.latestInsight || null);

        if (data.targetExam) {
          setExamName(data.targetExam);
          const parsedDate = new Date(data.targetDate);
          setExamDate(parsedDate);
          setDaysLeft(getDaysUntil(parsedDate));
        } else {
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setDaysLeft(getDaysUntil(defaultExam.date));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function handleOnboardingComplete(data: { targetExam: string; targetDate: string }) {
    setExamName(data.targetExam);
    const parsedDate = new Date(data.targetDate);
    setExamDate(parsedDate);
    setDaysLeft(getDaysUntil(parsedDate));
    setShowOnboarding(false);
    loadDashboardData(); // Refresh to ensure synced user state
  }

  const hasRealMoodData = moodLogs.length > 0 && moodLogs.some((m) => m.score !== null);
  const hasRealTriggers = triggers.length > 0;

  if (loading || !isUserLoaded) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
          <p className="text-sm font-medium text-slate-400">Assembling your wellness dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <main
      id="dashboard-main"
      className="min-h-screen bg-slate-50 px-2 py-4 sm:px-6 lg:px-8"
    >
      <h1 className="sr-only">Dashboard</h1>

      <div className="mx-auto max-w-6xl space-y-6">
        {/* ── Welcome Header ────────────────────────── */}
        <section
          id="dashboard-welcome"
          className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-md backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Greeting */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 shrink-0">
                <GreetingIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
                  {greeting.text}, {user?.firstName || "Aspirant"}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-xl">
                  {greeting.message}
                </p>
              </div>
            </div>

            {/* Exam countdown */}
            <div
              id="exam-countdown"
              className="flex items-center gap-3 rounded-xl bg-indigo-50/80 px-5 py-3 shrink-0 self-start sm:self-center"
            >
              <CalendarClock className="h-5 w-5 text-indigo-400" />
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  {examName}
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {daysLeft}{" "}
                  <span className="text-xs font-medium text-slate-500">
                    days to go
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Highlights Row ───────────────────── */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Stat 1: Avg Mood */}
          <div className="rounded-xl border border-white/10 bg-white/60 p-4 shadow-sm backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Mood (7d)</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-800">
                {stats.avgMood > 0 ? stats.avgMood : "--"}
              </span>
              <span className="text-xs text-slate-400">/ 5.0</span>
            </div>
          </div>

          {/* Stat 2: Weekly Logs */}
          <div className="rounded-xl border border-white/10 bg-white/60 p-4 shadow-sm backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Check-ins (7d)</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-800">{stats.weeklyLogs}</span>
              <span className="text-xs text-slate-400">times</span>
            </div>
          </div>

          {/* Stat 3: Reflections */}
          <div className="rounded-xl border border-white/10 bg-white/60 p-4 shadow-sm backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Reflections</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-800">{stats.totalEntries}</span>
              <span className="text-xs text-slate-400">entries</span>
            </div>
          </div>

          {/* Stat 4: Exam Date */}
          <div className="rounded-xl border border-white/10 bg-white/60 p-4 shadow-sm backdrop-blur-md">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Exam Date</p>
            <p className="mt-2 text-sm font-semibold text-slate-700 leading-6">
              {examDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </section>

        {/* ── Dashboard Content Grid ─────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left/Middle Column (Check-in, Timeline & Stress Triggers) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Unified check-in logger */}
            <UnifiedWellnessLogger onSuccess={loadDashboardData} />

            {/* Emotional timeline line/area chart */}
            <div className="relative">
              {!hasRealMoodData && (
                <div className="absolute right-4 top-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 border border-amber-200">
                    <Activity className="h-3 w-3 animate-pulse" />
                    Demo Data Shown
                  </span>
                </div>
              )}
              <EmotionalTimeline data={hasRealMoodData ? moodLogs : mockMoodData} />
            </div>

            {/* Stress triggers count */}
            <StressTriggers triggers={hasRealTriggers ? triggers : mockStressTriggers} />
          </div>

          {/* Right Column (Insights & Companion mini chat) */}
          <div className="space-y-6">
            {/* AI Coping Strategies card */}
            <div id="dashboard-ai-insights">
              {latestInsight ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-md backdrop-blur-xl">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 shrink-0">
                      <Brain className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Latest Coping Strategy</span>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-700">
                        {latestInsight.advice}
                      </p>
                      <p className="mt-4 text-[10px] text-slate-400">
                        Generated from your daily reflection on {new Date(latestInsight.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-md backdrop-blur-xl">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 shrink-0">
                      <Sparkles className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">AI Study Insights</span>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                        Select an emoji and write a reflection in the journaling check-in to generate personalized stress coping strategies here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mini companion chat */}
            <MiniChat />
          </div>
        </div>
      </div>

      {/* Onboarding Modal for New Users */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </main>
  );
}
