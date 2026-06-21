"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  MessageCircle,
  Heart,
  Home,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/companion", label: "Companion", icon: MessageCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-surface-container/60 backdrop-blur-xl border-r border-outline/10 z-30 transition-md shadow-card-static">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-outline/10">
          <Heart
            className="w-6 h-6 text-primary flex-shrink-0 animate-pulse-gentle"
            fill="var(--primary)"
          />
          <span className="text-base font-bold text-foreground leading-tight tracking-tight">
            The Mindful
            <br />
            Aspirant
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sidebar-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-5 py-3 rounded-[6px] text-sm font-medium transition-md active-tactile ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container shadow-sm font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-outline/10 space-y-2">
          <Link
            href="/"
            id="sidebar-home"
            className="flex items-center gap-3 px-5 py-2.5 rounded-[6px] text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-foreground transition-md active-tactile font-medium"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 px-5 py-2.5">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full border border-primary/20",
                },
              }}
            />
            <span className="text-sm font-medium text-on-surface-variant">
              Account
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="flex-1 md:ml-64 overflow-y-auto pb-20 md:pb-0 bg-transparent relative flex flex-col">

        
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container/90 backdrop-blur-lg border-t border-outline/10 z-30 transition-md shadow-card-static">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`mobile-nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 px-5 py-2 rounded-[6px] transition-md active-tactile ${
                  isActive
                    ? "bg-secondary-container text-on-secondary-container font-semibold"
                    : "text-on-surface-variant hover:text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
