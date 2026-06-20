import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Mindful Aspirant",
  description:
    "Your digital strategist for mental clarity and exam mastery. AI-powered wellness tracking for students preparing for competitive examinations.",
  keywords: [
    "mental wellness",
    "exam preparation",
    "student stress",
    "AI companion",
    "mood tracking",
    "journaling",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[var(--background)]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
