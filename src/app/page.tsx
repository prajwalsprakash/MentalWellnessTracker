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
  Smile,
  Check,
  AlertTriangle,
  Github,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

/* ──────────────────────────────────────────────────────────── */
/*  Scroll Reveal Hook                                          */
/* ──────────────────────────────────────────────────────────── */
function useScrollReveal(elementId: string) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // trigger reveal once
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [elementId]);
  return isVisible;
}

/* ──────────────────────────────────────────────────────────── */
/*  Landing Page — The Mindful Aspirant (Redesigned)            */
/* ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, isLoaded } = useUser();

  // Reveal elements on scroll
  const featuresVisible = useScrollReveal("features");
  const howItWorksVisible = useScrollReveal("how-it-works");
  const disclaimerVisible = useScrollReveal("disclaimer");
  const ctaVisible = useScrollReveal("cta");

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll Spy Observer
  useEffect(() => {
    const sections = ["hero", "features", "how-it-works", "disclaimer"];
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px",
      threshold: 0,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const steps = [
    {
      step: "01",
      title: "Check In Daily",
      desc: "Log your mood with a quick emoji check-in. Tag what you're feeling — anxious, motivated, tired, or anything in between.",
      icon: Heart,
    },
    {
      step: "02",
      title: "Reflect & Journal",
      desc: "Write your thoughts in a calming, distraction-free space. Our AI gently analyzes emotions and stressors to offer peaceful perspective.",
      icon: BookOpen,
    },
    {
      step: "03",
      title: "Chat with Your Companion",
      desc: "Talk through exam anxiety, study pressure, or daily stresses with an AI peer designed to understand and support you without judgment.",
      icon: MessageCircle,
    },
    {
      step: "04",
      title: "Track & Improve",
      desc: "Observe your emotional patterns over time on the Weekly Pulse chart. Identify what triggers stress and see what helps you bounce back.",
      icon: BarChart3,
    },
  ];

  function renderMockupContent() {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 border-b border-outline/10 pb-3 mb-2">
              <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <Smile className="w-5 h-5 animate-pulse-gentle" />
              </div>
              <span className="text-xs font-bold text-foreground">Mood Check-in &amp; Tags</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold">How are you feeling today?</p>
            <div className="flex justify-between bg-surface-container rounded-2xl p-2 border border-outline/5 shadow-sm">
              {["😔", "😕", "😐", "🙂", "😊"].map((emoji, idx) => (
                <span
                  key={idx}
                  className={`text-2xl p-2 rounded-xl transition-all duration-300 ${
                    idx === 4 ? "bg-secondary-container text-primary shadow-sm scale-110" : "opacity-60"
                  }`}
                >
                  {emoji}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {["Anxious", "Motivated", "Tired", "Focused"].map((tag, idx) => (
                <span
                  key={idx}
                  className={`text-[9px] font-bold px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    idx === 1
                      ? "bg-secondary-container text-primary border-primary/20 shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant border-outline/5"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-3.5 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 border-b border-outline/10 pb-3 mb-2">
              <div className="p-1.5 rounded-lg bg-[var(--tertiary)]/10 text-[var(--tertiary)]">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground">AI Reflection Analysis</span>
            </div>
            <div className="bg-surface-container-low/80 rounded-2xl p-3 border border-outline/5 text-xs text-foreground italic leading-relaxed font-medium">
              &quot;Stressed about the mock exam tomorrow. Afraid I won&apos;t get a good rank...&quot;
            </div>
            <div className="bg-secondary-container/45 rounded-2xl p-3 border border-primary/10 space-y-2">
              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AI Mindful Reframe
              </div>
              <p className="text-[10px] leading-relaxed text-foreground font-semibold">
                <strong>Perspective:</strong> A mock test is a tool to diagnose error points, not a measure of your intelligence. Focus on checking errors rather than the grade.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3.5 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 border-b border-outline/10 pb-3 mb-2">
              <div className="p-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Companion Vibe Check</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-secondary-container text-primary flex items-center justify-center text-[9px] font-bold">🤖</div>
                <div className="bg-surface-container text-foreground text-[10px] rounded-xl px-3 py-2 rounded-tl-none leading-relaxed max-w-[85%] font-semibold border border-outline/5 shadow-sm">
                  Let&apos;s take a 1-minute breathing break. Inhale for 4 seconds... 🌬️
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-primary text-primary-foreground text-[10px] rounded-xl px-3 py-2 rounded-tr-none leading-relaxed max-w-[85%] font-semibold shadow-sm">
                  Okay, doing it now. Focus is returning! 🧘‍♂️
                </div>
                <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[9px] font-bold">👤</div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 border-b border-outline/10 pb-3 mb-2">
              <div className="p-1.5 rounded-lg bg-[var(--tertiary)]/10 text-[var(--tertiary)]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Weekly Emotional Pulse</span>
            </div>
            <div className="h-28 w-full flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mockGradientTimeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--tertiary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--tertiary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="300" y2="20" stroke="var(--outline)" strokeOpacity="0.1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="var(--outline)" strokeOpacity="0.1" strokeDasharray="3 3" />
                <path
                  d="M0,80 C50,45 70,65 100,55 C130,45 170,25 200,35 C230,45 270,30 300,45 L300,100 L0,100 Z"
                  fill="url(#mockGradientTimeline)"
                />
                <path
                  d="M0,80 C50,45 70,65 100,55 C130,45 170,25 200,35 C230,45 270,30 300,45"
                  fill="none"
                  stroke="var(--tertiary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="55" r="4" fill="var(--background)" stroke="var(--tertiary)" strokeWidth="2" />
                <circle cx="200" cy="35" r="4" fill="var(--background)" stroke="var(--tertiary)" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div id="hero" className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Dynamic Keyframes for drawing chart lines & floating auric gradients */}
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: drawLine 3.5s ease-in-out forwards infinite;
        }
        @keyframes pulseGentle {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-pulse-gentle {
          animation: pulseGentle 4s ease-in-out infinite;
        }
      `}</style>



      {/* ── Glassmorphism Navigation Bar ─────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrollY > 40
            ? "bg-surface-container/80 backdrop-blur-md border-b border-outline/10 shadow-card-static py-3.5"
            : "bg-transparent border-b border-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 active-tactile">
            <Heart className="w-6 h-6 text-primary flex-shrink-0" fill="var(--primary)" />
            <span className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              The Mindful Aspirant
            </span>
          </Link>

          {/* Anchor Links (Hidden on small mobile) */}
          <div className="hidden sm:flex items-center gap-6">
            {[
              { id: "features", label: "Features" },
              { id: "how-it-works", label: "How It Works" },
              { id: "disclaimer", label: "Disclaimer" },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`text-xs sm:text-sm font-bold tracking-wide transition-colors relative py-1 hover:text-primary ${
                  activeSection === item.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant/80"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isLoaded && !isSignedIn && (
              <>
                <Link
                  href="/sign-in"
                  id="nav-sign-in"
                  className="text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-foreground transition-colors mr-1 sm:mr-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  id="nav-sign-up"
                  className="md-btn-filled text-[10px] sm:text-xs font-semibold px-4 sm:px-5 py-2 sm:py-2.5"
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
                  className="text-xs sm:text-sm font-semibold text-on-surface-variant hover:text-foreground transition-colors mr-1 sm:mr-2"
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
      <section className="relative pt-32 pb-20 sm:pt-36 sm:pb-24 px-6 max-w-6xl mx-auto z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Column */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container shadow-sm border border-primary/5 animate-pulse-gentle">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                AI-Powered Wellness for Students
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Your Digital Strategist for{" "}
              <span className="text-primary">Mental Clarity</span> and{" "}
              <span className="text-tertiary">Exam Mastery</span>
            </h1>

            <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed font-medium max-w-xl">
              Navigate the emotional challenges of competitive exam preparation
              with an empathetic AI companion, daily journaling, and intelligent
              mood tracking — all in one calming space.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              {isLoaded && !isSignedIn && (
                <Link
                  href="/sign-up"
                  id="hero-cta"
                  className="w-full sm:w-auto md-btn-filled text-sm font-semibold px-8 py-3.5 inline-flex items-center gap-2 justify-center shadow-md active-tactile"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {isLoaded && isSignedIn && (
                <Link
                  href="/dashboard"
                  id="hero-cta-dashboard"
                  className="w-full sm:w-auto md-btn-filled text-sm font-semibold px-8 py-3.5 inline-flex items-center gap-2 justify-center shadow-md active-tactile"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <a
                href="#features"
                className="w-full sm:w-auto md-btn-outlined text-sm font-semibold px-8 py-3.5 inline-flex items-center gap-2 justify-center bg-surface-container/30 border-outline/10 backdrop-blur-sm active-tactile"
              >
                Explore Features
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap items-center gap-5 text-[11px] font-bold text-on-surface-variant/80 pt-6">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-primary" />
                100% Private &amp; Secure
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-tertiary" fill="var(--tertiary)" />
                Built with Empathy
              </span>
              <span className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-primary" />
                Gemini-Powered Insights
              </span>
            </div>
          </div>

          {/* Hero Right Column: High Fidelity SVG Dashboard Mockup */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            <div className="relative w-full max-w-md group/mockup">
              {/* Colored ambient backup card shadow */}
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-[var(--primary)]/10 to-[var(--tertiary)]/10 blur-2xl opacity-75 group-hover/mockup:opacity-100 transition-opacity duration-700" />
              
              {/* Card Container */}
              <div className="relative rounded-[32px] border border-outline/10 bg-surface-container/60 backdrop-blur-xl p-5 shadow-card">
                {/* Header Window Bar */}
                <div className="flex items-center justify-between border-b border-outline/10 pb-3 mb-4">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-[9px] font-bold text-on-surface-variant/40 tracking-wider uppercase">
                    the-mindful-aspirant.app
                  </span>
                  <div className="w-5" />
                </div>

                <div className="space-y-4">
                  {/* Stats Highlights row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="rounded-xl bg-surface-container-low/70 p-2.5 border border-outline/5 shadow-sm">
                      <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider block">Mood Pulse</span>
                      <span className="text-[11px] font-bold text-primary mt-0.5 block">😊 Great</span>
                    </div>
                    <div className="rounded-xl bg-surface-container-low/70 p-2.5 border border-outline/5 shadow-sm">
                      <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider block">Stress Level</span>
                      <span className="text-[11px] font-bold text-tertiary mt-0.5 block">Low</span>
                    </div>
                    <div className="rounded-xl bg-surface-container-low/70 p-2.5 border border-outline/5 shadow-sm">
                      <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-wider block">Target Exam</span>
                      <span className="text-[11px] font-bold text-foreground mt-0.5 block">JEE 2026</span>
                    </div>
                  </div>

                  {/* SVG Chart display */}
                  <div className="rounded-xl bg-surface-container-low/50 p-3.5 border border-outline/5 relative overflow-hidden shadow-inner">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-bold text-foreground">Weekly Emotional Pulse</span>
                      <span className="text-[8px] font-bold text-primary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live Tracker
                      </span>
                    </div>
                    
                    <div className="h-24 w-full flex items-end">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="mockGradientHero" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="20" x2="300" y2="20" stroke="var(--outline)" strokeOpacity="0.08" strokeDasharray="3 3" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="var(--outline)" strokeOpacity="0.08" strokeDasharray="3 3" />
                        <line x1="0" y1="80" x2="300" y2="80" stroke="var(--outline)" strokeOpacity="0.08" strokeDasharray="3 3" />
                        
                        <path
                          d="M0,80 C50,45 70,65 100,55 C130,45 170,25 200,35 C230,45 270,30 300,45 L300,100 L0,100 Z"
                          fill="url(#mockGradientHero)"
                        />
                        <path
                          d="M0,80 C50,45 70,65 100,55 C130,45 170,25 200,35 C230,45 270,30 300,45"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          className="animate-draw-line"
                        />
                        <circle cx="100" cy="55" r="3" fill="var(--background)" stroke="var(--primary)" strokeWidth="1.5" />
                        <circle cx="200" cy="35" r="3" fill="var(--background)" stroke="var(--primary)" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Emojis check-in board */}
                  <div className="grid grid-cols-5 gap-1.5 bg-surface-container-low/70 p-2 border border-outline/5 rounded-xl shadow-sm">
                    {[" Rough 😔", " Low 😕", " Okay 😐", " Good 🙂", " Great 😊"].map((labelEmoji, idx) => {
                      const isActive = idx === 4;
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all duration-300 ${
                            isActive ? "bg-secondary-container text-primary font-bold shadow-sm" : "opacity-40"
                          }`}
                        >
                          <span className="text-base">{labelEmoji.split(" ")[2]}</span>
                          <span className="text-[7px] tracking-tight">{labelEmoji.split(" ")[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Features Section ───────────────────────────────── */}
      <section
        id="features"
        className={`py-20 px-6 relative z-10 transition-all duration-1000 transform ${
          !mounted || featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Everything You Need to <span className="text-primary">Stay Balanced</span>
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant font-medium max-w-xl mx-auto">
              Tools designed specifically for students facing the pressure of
              competitive examinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Dashboard */}
            <div className="group rounded-[28px] bg-surface-container/45 backdrop-blur-md border border-outline/10 p-8 shadow-card cursor-default relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--primary)] to-[var(--tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                Emotional Dashboard
              </h3>
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                Visualize your weekly emotional patterns with beautiful charts.
                Identify stress triggers and track your progress over time.
              </p>
            </div>

            {/* Feature 2: Journal */}
            <div className="group rounded-[28px] bg-surface-container/45 backdrop-blur-md border border-outline/10 p-8 shadow-card cursor-default relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--tertiary)] to-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <BookOpen className="w-7 h-7 text-tertiary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                AI-Analyzed Journaling
              </h3>
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                Write freely in a distraction-free space. Our AI gently
                identifies emotions, stressors, and offers calming reframing
                strategies.
              </p>
            </div>

            {/* Feature 3: Companion */}
            <div className="group rounded-[28px] bg-surface-container/45 backdrop-blur-md border border-outline/10 p-8 shadow-card cursor-default relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[var(--primary)] to-[var(--tertiary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-sm">
                <MessageCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                Study Companion Chat
              </h3>
              <p className="text-sm font-medium text-on-surface-variant leading-relaxed">
                Chat in real-time with an empathetic AI peer who understands exam
                stress. Get instant coping strategies and encouragement.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── How It Works Section (Interactive) ───────────────── */}
      <section
        id="how-it-works"
        className={`py-16 px-6 bg-surface-container/20 rounded-[48px] border border-outline/5 relative z-10 transition-all duration-1000 transform ${
          !mounted || howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10 tracking-tight">
            How It Works
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Steps Left Side */}
            <div className="space-y-3">
              {steps.map((item, idx) => {
                const isActive = activeStep === idx;
                return (
                  <div
                    key={item.step}
                    onMouseEnter={() => setActiveStep(idx)}
                    onClick={() => setActiveStep(idx)}
                    className={`flex gap-4 items-start p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-surface-container border-primary/20 shadow-card-static translate-x-1"
                        : "bg-transparent border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-card-static transition-transform ${
                          isActive ? "bg-primary text-primary-foreground scale-105" : "bg-secondary-container text-on-secondary-container"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">
                        Step {item.step}
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-0.5 mb-1 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-on-surface-variant leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mockup Display Right Side */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[340px] h-80 rounded-3xl border border-outline/10 bg-surface-container/60 backdrop-blur-md p-5 shadow-card-static flex flex-col justify-center">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[8px] font-bold text-on-surface-variant/40 tracking-widest uppercase">
                  <Sparkles className="w-2.5 h-2.5 text-primary" /> Active Preview
                </div>
                {renderMockupContent()}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Medical Disclaimer ─────────────────────────────── */}
      <section
        id="disclaimer"
        className={`py-16 px-6 relative z-10 transition-all duration-1000 transform ${
          !mounted || disclaimerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="rounded-[28px] border border-outline/10 bg-surface-container-low/60 backdrop-blur-md p-6 sm:p-8 shadow-card-static relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500/80" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-amber-800 dark:text-amber-300 tracking-tight">
                  Important Disclaimer
                </h3>
                <p className="text-on-surface-variant/90 text-xs sm:text-sm leading-relaxed font-semibold">
                  The Mindful Aspirant is a peer support tool designed for exam
                  preparation stress management. It is <strong>not a substitute</strong> for professional mental
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
      <section
        id="cta"
        className={`py-20 px-6 text-center relative z-10 transition-all duration-1000 transform ${
          !mounted || ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Ready to Reclaim Your <span className="text-primary">Peace of Mind</span>?
          </h2>
          <p className="text-base sm:text-lg text-on-surface-variant font-medium max-w-xl mx-auto">
            Join students who are navigating exam stress with clarity and
            confidence.
          </p>
          <div className="pt-2">
            {isLoaded && !isSignedIn && (
              <Link
                href="/sign-up"
                id="footer-cta"
                className="inline-flex items-center gap-2 px-10 py-4 md-btn-filled text-base font-semibold shadow-md active-tactile"
              >
                Begin Your Journey — It&apos;s Free
                <Sparkles className="w-5 h-5 animate-pulse" />
              </Link>
            )}
            {isLoaded && isSignedIn && (
              <Link
                href="/dashboard"
                id="footer-cta-dashboard"
                className="inline-flex items-center gap-2 px-10 py-4 md-btn-filled text-base font-semibold shadow-md active-tactile"
              >
                Go to Dashboard
                <Sparkles className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-outline/10 py-10 px-6 relative z-10 bg-surface-container/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 active-tactile">
            <Heart className="w-5 h-5 text-primary flex-shrink-0" fill="var(--primary)" />
            <span className="text-sm font-bold text-foreground tracking-tight">
              The Mindful Aspirant
            </span>
          </Link>
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-xs font-bold text-on-surface-variant/70">
              Built with care for students everywhere. Not a medical service.
            </p>
            <a
              href="https://github.com/prajwalsprakash/MentalWellnessTracker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              Open Source on GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
