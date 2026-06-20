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
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: chatTransport,
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
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  }

  /* Handle clicking a starter chip */
  function handleStarterClick(prompt: string) {
    sendMessage({ text: prompt });
  }

  /* Extract text from message parts */
  function getMessageText(
    message: (typeof messages)[0]
  ): string {
    if (!message.parts) return "";
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-1rem)] flex-col">
      {/* ---- Header ---- */}
      <header className="shrink-0 border-b border-slate-100 bg-white/60 backdrop-blur-lg rounded-t-2xl">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <Bot className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 sm:text-xl">
                Your Study Companion
              </h1>
              <p className="text-xs text-slate-400">
                An empathetic AI peer for exam preparation support. Not a
                therapist.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
            <p className="text-[11px] leading-relaxed text-amber-700">
              This is a peer support tool, not professional mental health
              advice. If you&apos;re in crisis, please contact a helpline.
            </p>
          </div>
        </div>
      </header>

      {/* ---- Chat area ---- */}
      <div
        ref={scrollRef}
        id="companion-chat-area"
        className="flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          {!hasMessages ? (
            /* ---- Empty state ---- */
            <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                <Bot className="h-8 w-8 text-indigo-300" />
              </div>
              <h2 className="mb-2 text-lg font-semibold text-slate-700">
                Hi! I&apos;m here to listen and help you navigate exam stress.
              </h2>
              <p className="mb-6 max-w-md text-sm text-slate-400">
                Share what&apos;s on your mind, or pick one of these to get
                started:
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    id={`starter-${prompt.slice(0, 12).replace(/\s/g, "-").toLowerCase()}`}
                    type="button"
                    onClick={() => handleStarterClick(prompt)}
                    className="rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm text-indigo-600 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md"
                  >
                    <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-indigo-300" />
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
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUser
                          ? "bg-indigo-400 text-white"
                          : "border border-slate-100 bg-white text-slate-400"
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
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          isUser
                            ? "rounded-br-md bg-indigo-400 text-white"
                            : "rounded-bl-md border border-white/20 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl"
                        } ${isStreaming ? "animate-pulse" : ""}`}
                      >
                        <p className="whitespace-pre-wrap">{text}</p>
                      </div>
                      <p
                        className={`text-[10px] text-slate-300 ${
                          isUser ? "text-right" : "text-left"
                        }`}
                      >
                        {formatTime(new Date())}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex items-end gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl rounded-bl-md border border-white/20 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-300 [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Input bar ---- */}
      <div className="shrink-0 border-t border-slate-100 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/70 px-4 py-2 shadow-lg backdrop-blur-xl"
          >
            <input
              id="companion-chat-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share what's on your mind..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
            />
            <button
              id="companion-send-button"
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-400 text-white shadow-md transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4 transition-transform duration-200 hover:rotate-[-12deg]" />
            </button>
          </form>
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
