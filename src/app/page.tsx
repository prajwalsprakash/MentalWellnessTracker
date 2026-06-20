"use client";

import Link from "next/link";
import {
  Heart,
  Brain,
  BookOpen,
  MessageCircle,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

/* ──────────────────────────────────────────────────────────── */
/*  Landing Page — The Mindful Aspirant                        */
/* ──────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          backgroundColor:
            scrollY > 50 ? "rgba(248, 250, 252, 0.85)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
          borderBottom:
            scrollY > 50 ? "1px solid rgba(226, 232, 240, 0.6)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-[var(--primary)]" fill="#818cf8" />
            <span className="text-lg font-semibold text-[var(--foreground)]">
              The Mindful Aspirant
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isLoaded && !isSignedIn && (
              <>
                <Link
                  href="/sign-in"
                  id="nav-sign-in"
                  className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  id="nav-sign-up"
                  className="text-sm font-medium px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-all hover:shadow-lg hover:shadow-indigo-200"
                >
                  Get Started
                </Link>
              </>
            )}
            {isLoaded && isSignedIn && (
              <>
                <Link
                  href="/dashboard"
                  id="nav-dashboard"
                  className="text-sm font-medium px-4 py-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Ambient background orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-medium text-indigo-600">
              AI-Powered Wellness for Students
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight mb-6">
            Your Digital Strategist for{" "}
            <span className="gradient-text">Mental Clarity</span> and{" "}
            <span className="gradient-text">Exam Mastery</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Navigate the emotional challenges of competitive exam preparation
            with an empathetic AI companion, daily journaling, and intelligent
            mood tracking — all in one calming space.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {isLoaded && !isSignedIn && (
              <Link
                href="/sign-up"
                id="hero-cta"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-semibold hover:opacity-90 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            {isLoaded && isSignedIn && (
              <Link
                href="/dashboard"
                id="hero-cta-dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-semibold hover:opacity-90 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            )}
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] text-lg font-medium hover:bg-white/50 transition-all"
            >
              Learn More
              <ChevronDown className="w-5 h-5" />
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              100% Private & Secure
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-400" />
              Built with Empathy
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-indigo-400" />
              Powered by Gemini AI
            </span>
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Stay Balanced</span>
            </h2>
            <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
              Tools designed specifically for students facing the pressure of
              competitive examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Dashboard */}
            <div className="group glass rounded-2xl p-8 card-hover cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                Emotional Dashboard
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Visualize your weekly emotional patterns with beautiful charts.
                Identify stress triggers and track your progress over time.
              </p>
            </div>

            {/* Feature 2: Journal */}
            <div className="group glass rounded-2xl p-8 card-hover cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                AI-Analyzed Journaling
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Write freely in a distraction-free space. Our AI gently
                identifies emotions, stressors, and offers calming reframing
                strategies.
              </p>
            </div>

            {/* Feature 3: Companion */}
            <div className="group glass rounded-2xl p-8 card-hover cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">
                Study Companion Chat
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                Chat in real-time with an empathetic AI peer who understands exam
                stress. Get instant coping strategies and encouragement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent to-indigo-50/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-[var(--foreground)] mb-16">
            How It Works
          </h2>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Check In Daily",
                desc: "Log your mood with a quick emoji check-in. Tag what you're feeling — anxious, motivated, tired, or anything in between.",
                icon: Heart,
                color: "text-rose-400",
                bg: "bg-rose-50",
              },
              {
                step: "02",
                title: "Reflect & Journal",
                desc: "Write your thoughts in a calming, distraction-free space. Our AI analyzes emotions and stressors — no judgment, just insight.",
                icon: BookOpen,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              {
                step: "03",
                title: "Chat with Your Companion",
                desc: "Talk through exam anxiety, study pressure, or daily challenges with an AI peer who provides practical coping strategies.",
                icon: MessageCircle,
                color: "text-[var(--primary)]",
                bg: "bg-indigo-50",
              },
              {
                step: "04",
                title: "Track & Improve",
                desc: "Watch your emotional patterns evolve on your dashboard. Celebrate progress and identify what helps you thrive.",
                icon: BarChart3,
                color: "text-amber-500",
                bg: "bg-amber-50",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center`}
                  >
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
                    Step {item.step}
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Medical Disclaimer ─────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">
                  Important Disclaimer
                </h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  The Mindful Aspirant is a peer support tool designed for exam
                  preparation stress management. It is{" "}
                  <strong>not a substitute</strong> for professional mental
                  health advice, diagnosis, or treatment. If you are
                  experiencing a mental health crisis, please contact a
                  qualified professional or call your local emergency services
                  immediately. Our AI companion is empathetic but is not a
                  licensed therapist or counselor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-6">
            Ready to Reclaim Your <span className="gradient-text">Peace of Mind</span>?
          </h2>
          <p className="text-lg text-[var(--muted-foreground)] mb-8">
            Join students who are navigating exam stress with clarity and
            confidence.
          </p>
          {isLoaded && !isSignedIn && (
            <Link
              href="/sign-up"
              id="footer-cta"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-semibold hover:opacity-90 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
            >
              Begin Your Journey — It&apos;s Free
              <Sparkles className="w-5 h-5" />
            </Link>
          )}
          {isLoaded && isSignedIn && (
            <Link
              href="/dashboard"
              id="footer-cta-dashboard"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-[var(--primary)] text-white text-lg font-semibold hover:opacity-90 transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5"
            >
              Go to Dashboard
              <Sparkles className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[var(--primary)]" fill="#818cf8" />
            <span className="text-sm font-medium text-[var(--foreground)]">
              The Mindful Aspirant
            </span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Built with care for students everywhere. Not a medical service.
          </p>
        </div>
      </footer>
    </div>
  );
}
