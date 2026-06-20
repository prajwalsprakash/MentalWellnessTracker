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
} from "lucide-react";

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

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* ── Desktop Sidebar ─────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 glass-strong border-r border-[var(--border)] z-30">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-[var(--border)]">
          <Heart
            className="w-6 h-6 text-[var(--primary)] flex-shrink-0"
            fill="#818cf8"
          />
          <span className="text-base font-semibold text-[var(--foreground)] leading-tight">
            The Mindful
            <br />
            Aspirant
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`sidebar-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 text-[var(--primary)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:bg-slate-50 hover:text-[var(--foreground)]"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[var(--border)] space-y-2">
          <Link
            href="/"
            id="sidebar-home"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--muted-foreground)] hover:bg-slate-50 hover:text-[var(--foreground)] transition-all"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 px-4 py-2.5">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <span className="text-sm text-[var(--muted-foreground)]">
              Account
            </span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────── */}
      <main className="flex-1 md:ml-64 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Nav ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-strong border-t border-[var(--border)] z-30">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`mobile-nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
