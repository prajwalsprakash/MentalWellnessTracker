import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1c1c1c",
        },
      }}
    >
      <html
        lang="en"
        className="h-full antialiased"
      >
        <body className="min-h-full flex flex-col bg-[var(--background)] relative overflow-x-hidden">
          {/* Lovable-inspired premium background glow flow & noise texture */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0A0A]">
            {/* Ambient Blobs - using pure radial gradients instead of heavy blur filters for smooth 60fps rendering */}
            <div 
              className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full opacity-40 animate-float1" 
              style={{ background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.05) 40%, transparent 65%)" }}
            />
            <div 
              className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full opacity-40 animate-float2" 
              style={{ background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 65%)" }}
            />
            <div 
              className="absolute top-[20%] right-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full opacity-30 animate-float3" 
              style={{ background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.03) 40%, transparent 65%)" }}
            />
            
            {/* Extremely lightweight CSS noise overlay (using a very subtle repeating radial pattern instead of expensive SVG filter to avoid stutter) */}
            <div 
              className="absolute inset-0 opacity-[0.05] mix-blend-screen" 
              style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "4px 4px" }} 
            />
          </div>
          
          {/* Main content wrapper */}
          <div className="relative z-10 flex-1 flex flex-col">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
