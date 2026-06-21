"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Bot, User, Sparkles, Shield } from "lucide-react";
import CrisisModal from "@/components/shared/crisis-modal";
import { detectCrisis } from "@/lib/crisis-detection";

/* ------------------------------------------------------------------ */
/*  Starter prompts                                                    */
/* ------------------------------------------------------------------ */

const STARTER_PROMPTS = [
  "I'm feeling overwhelmed by my study schedule",
  "How can I manage exam anxiety?",
  "I couldn't sleep well last night",
  "I failed a mock test and feel terrible",
];

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

/* ------------------------------------------------------------------ */
/*  Timestamp helper                                                   */
/* ------------------------------------------------------------------ */

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CompanionPage() {
  const [crisisTriggered, setCrisisTriggered] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: chatTransport,
    onError: (error) => {
      console.error("Companion chat error:", error);
      setChatError("Failed to receive a response. Please check your connection and try again.");
    }
  });

  const isLoading = status === "streaming" || status === "submitted";

  /* Auto-scroll on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  /* Crisis detection after each new message */
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "user" || lastMsg.role === "assistant") {
      // Extract text content from parts
      const textContent = lastMsg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join(" ");

      if (textContent) {
        const { isCrisis } = detectCrisis(textContent);
        if (isCrisis) setCrisisTriggered(true);
      }
    }
  }, [messages]);

  /* Handle form submit */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    setChatError(null);
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  }

  /* Handle clicking a starter chip */
  function handleStarterClick(prompt: string) {
    setChatError(null);
    sendMessage({ text: prompt });
  }

  /* Extract text from message parts with fallback to content */
  function getMessageText(message: (typeof messages)[0]): string {
    let text = "";
    if (message.parts && Array.isArray(message.parts)) {
      text = message.parts
        .filter((p): p is { type: "text"; text: string } => p?.type === "text")
        .map((p) => p.text)
        .join("");
    }
    return text || (message as any).content || "";
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      {/* ---- Header ---- */}
      <header className="shrink-0 border border-outline/10 bg-surface-container/60 backdrop-blur-lg rounded-[24px] mb-4 shadow-card-static">
        <div className="mx-auto max-w-3xl px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container text-on-secondary-container shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Your Study Companion
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">
                An empathetic AI peer for exam preparation support. Not a therapist.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[var(--outline)]/15 bg-[var(--surface-container)] px-4 py-2.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tertiary)]" />
            <p className="text-[11px] leading-relaxed text-[var(--on-surface-variant)] font-medium">
              This is a peer support tool, not professional mental health
              advice. If you&apos;re in crisis, please contact a helpline.
            </p>
          </div>
        </div>
      </header>

      {/* ---- Unified Chat Window Container ---- */}
      <div className="flex flex-col flex-1 min-h-0 bg-surface-container/40 border border-outline/10 rounded-[24px] shadow-card-static overflow-hidden mb-2">
        {/* ---- Chat area ---- */}
        <div
          ref={scrollRef}
          id="companion-chat-area"
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            {!hasMessages ? (
              /* ---- Empty state ---- */
              <div className="flex h-full min-h-[45vh] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-secondary-container text-on-secondary-container shadow-sm">
                  <Bot className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-foreground tracking-tight">
                  Hi! I&apos;m here to listen and help you navigate exam stress.
                </h2>
                <p className="mb-6 max-w-md text-sm text-on-surface-variant font-medium">
                  Share what&apos;s on your mind, or pick one of these to get started:
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      id={`starter-${prompt.slice(0, 12).replace(/\s/g, "-").toLowerCase()}`}
                      type="button"
                      onClick={() => handleStarterClick(prompt)}
                      className="md-btn-outlined text-xs font-semibold px-4 py-2 rounded-full border border-outline/20 bg-surface-container active-tactile"
                    >
                      <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ---- Message list ---- */
              <div className="space-y-4">
                {messages.map((message) => {
                  const isUser = message.role === "user";
                  const isStreaming =
                    !isUser &&
                    isLoading &&
                    message.id === messages[messages.length - 1]?.id;

                  const text = getMessageText(message);

                  return (
                    <div
                      key={message.id}
                      id={`message-${message.id}`}
                      className={`flex items-end gap-2.5 ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
                          isUser
                            ? "bg-primary text-white"
                            : "bg-secondary-container text-on-secondary-container border border-outline/5"
                        }`}
                      >
                        {isUser ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>

                      {/* Bubble */}
                      <div className="max-w-[80%] space-y-1">
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            isUser
                              ? "rounded-br-none bg-primary text-primary-foreground"
                              : "rounded-bl-none bg-surface-container text-foreground border border-outline/5"
                          } ${isStreaming ? "ring-2 ring-primary/25" : ""}`}
                        >
                          <div className="relative">
                            <p className="whitespace-pre-wrap font-medium">{text}</p>
                            {isStreaming && !text && (
                              <div className="flex gap-1 mt-1">
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current/40 [animation-delay:0ms]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current/40 [animation-delay:150ms]" />
                                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current/40 [animation-delay:300ms]" />
                              </div>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-[10px] font-semibold text-on-surface-variant/60 ${
                            isUser ? "text-right" : "text-left"
                          }`}
                        >
                          {formatTime((message as any).createdAt ? new Date((message as any).createdAt) : new Date())}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Error display inside message list */}
                {chatError && (
                  <div className="flex items-end gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/10 shadow-sm">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="max-w-[80%] space-y-1">
                      <div className="rounded-2xl rounded-bl-none bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-3 text-sm leading-relaxed border border-rose-500/20 shadow-sm">
                        <p className="font-semibold">{chatError}</p>
                        <button
                          onClick={() => {
                            setChatError(null);
                            sendMessage();
                          }}
                          className="mt-2 text-xs underline font-bold hover:opacity-80 block text-left"
                        >
                          Retry sending message
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Typing indicator (only when waiting for initial response chunks) */}
                {isLoading && messages[messages.length - 1]?.role === "user" && !chatError && (
                  <div className="flex items-end gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container border border-outline/5 shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-bl-none bg-surface-container px-4 py-3 border border-outline/5 shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-on-secondary-container/40 [animation-delay:0ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-on-secondary-container/40 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-on-secondary-container/40 [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ---- Input bar ---- */}
        <div className="shrink-0 border-t border-outline/10 bg-surface-container/60 backdrop-blur-lg">
          <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 rounded-full bg-surface-container-low px-5 py-2.5 border border-outline/5 shadow-inner"
            >
              <input
                id="companion-chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Share what's on your mind..."
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-on-surface-variant/40 font-medium"
              />
              <button
                id="companion-send-button"
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-md active-tactile disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4 transition-transform duration-200 hover:rotate-[-12deg]" />
              </button>
            </form>
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
