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
          <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
          <p className="text-sm font-medium text-[var(--on-surface-variant)]">Assembling your wellness dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-main" className="space-y-6">
      <h1 className="sr-only">Dashboard</h1>
        {/* ── Welcome Header ────────────────────────── */}
        <section
          id="dashboard-welcome"
          className="rounded-[24px] bg-surface-container border border-outline/5 p-6 shadow-card sm:p-8"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Greeting */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm shrink-0">
                <GreetingIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {greeting.text}, {user?.firstName || "Aspirant"}
                </h2>
                <p className="mt-1.5 text-sm text-on-surface-variant leading-relaxed max-w-xl font-medium">
                  {greeting.message}
                </p>
              </div>
            </div>

            {/* Exam countdown */}
            <div
              id="exam-countdown"
              className="flex items-center gap-3 rounded-2xl bg-secondary-container px-5 py-3 shrink-0 self-start sm:self-center shadow-sm"
            >
              <CalendarClock className="h-5 w-5 text-on-secondary-container" />
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider text-on-secondary-container/80">
                  {examName}
                </p>
                <p className="text-lg font-bold text-on-secondary-container">
                  {daysLeft}{" "}
                  <span className="text-xs font-semibold text-on-secondary-container/75">
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
          <div className="rounded-xl bg-surface-container border border-outline p-5 shadow-card">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Mood (7d)</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">
                {stats.avgMood > 0 ? stats.avgMood : "--"}
              </span>
              <span className="text-xs font-medium text-on-surface-variant">/ 5.0</span>
            </div>
          </div>

          {/* Stat 2: Weekly Logs */}
          <div className="rounded-xl bg-surface-container border border-outline p-5 shadow-card">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Check-ins (7d)</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">{stats.weeklyLogs}</span>
              <span className="text-xs font-medium text-on-surface-variant">times</span>
            </div>
          </div>

          {/* Stat 3: Reflections */}
          <div className="rounded-xl bg-surface-container border border-outline p-5 shadow-card">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total Reflections</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground">{stats.totalEntries}</span>
              <span className="text-xs font-medium text-on-surface-variant">entries</span>
            </div>
          </div>

          {/* Stat 4: Exam Date */}
          <div className="rounded-xl bg-surface-container border border-outline p-5 shadow-card">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Target Exam Date</p>
            <p className="mt-2 text-sm font-bold text-foreground leading-6">
              {examDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </section>

        {/* ── Dashboard Content Grid ─────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Row 1: Daily Check-In & Reflection and Latest Coping Strategy */}
          <div className="lg:col-span-2">
            <UnifiedWellnessLogger className="h-full" onSuccess={loadDashboardData} />
          </div>
          <div id="dashboard-ai-insights" className="h-full">
            {latestInsight ? (
              <div className="h-full rounded-xl border border-outline bg-[var(--secondary-container)]/20 p-6 shadow-card flex flex-col justify-between">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--secondary-container)] text-[var(--primary)] shrink-0 shadow-sm">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">Latest Coping Strategy</span>
                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--foreground)] font-medium">
                      {latestInsight.advice}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[10px] text-[var(--on-surface-variant)]/70 font-medium shrink-0">
                  Generated from your daily reflection on {new Date(latestInsight.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="h-full rounded-xl border border-outline bg-surface-container p-6 shadow-card flex flex-col justify-between">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shrink-0 shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">AI Study Insights</span>
                    <p className="mt-2.5 text-sm leading-relaxed text-on-surface-variant font-medium">
                      Select an emoji and write a reflection in the journaling check-in to generate personalized stress coping strategies here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 2: Weekly Emotional Pulse and Quick Companion Chat */}
          <div className="relative lg:col-span-2">
            {!hasRealMoodData && (
              <div className="absolute right-4 top-4 z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-0.5 text-[10px] font-bold text-on-secondary-container border border-outline/5 shadow-sm">
                  <Activity className="h-3 w-3 animate-pulse" />
                  Demo Data Shown
                </span>
              </div>
            )}
            <EmotionalTimeline className="h-full" data={hasRealMoodData ? moodLogs : mockMoodData} />
          </div>
          <div>
            <MiniChat className="h-full" />
          </div>

          {/* Row 3: Stress Triggers */}
          <div className="lg:col-span-2">
            <StressTriggers triggers={hasRealTriggers ? triggers : mockStressTriggers} />
          </div>
        </div>

      {/* Onboarding Modal for New Users */}
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
}
