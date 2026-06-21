"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

interface MiniChatProps {
  className?: string;
}

export default function MiniChat({ className = "" }: MiniChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
    onError: (error) => {
      console.error("Mini chat error:", error);
      setChatError("Failed to receive a response. Try again.");
    }
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll the tiny message container
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    setChatError(null);
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  }

  function handleQuickAction(text: string) {
    setChatError(null);
    sendMessage({ text });
  }

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

  return (
    <div
      id="dashboard-mini-chat"
      className={`rounded-xl bg-surface-container border border-outline p-5 shadow-card flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-container text-on-secondary-container shadow-sm">
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Quick Companion Chat</h3>
            <p className="text-[10px] text-on-surface-variant font-medium">Vibe check with your AI peer</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div
        ref={scrollRef}
        className="mb-3 flex-1 min-h-[16rem] overflow-y-auto rounded-2xl border border-outline/5 bg-surface-container-low p-3.5"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="h-6 w-6 text-on-surface-variant/50 mb-1 animate-pulse-gentle" />
            <p className="text-[11px] font-semibold text-foreground">Need a quick boost or stress relief?</p>
            <div className="mt-2 flex.5 flex gap-1.5 justify-center">
              <button
                type="button"
                onClick={() => handleQuickAction("Give me a quick 1-minute breathing exercise")}
                className="rounded-full border border-outline/10 bg-surface-container px-2.5 py-1 text-[9px] text-primary font-bold active-tactile cursor-pointer"
              >
                🌬️ Breath
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction("I am feeling exam self-doubt right now")}
                className="rounded-full border border-outline/10 bg-surface-container px-2.5 py-1 text-[9px] text-primary font-bold active-tactile cursor-pointer"
              >
                💡 Support
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isStreaming =
                !isUser &&
                isLoading &&
                msg.id === messages[messages.length - 1]?.id;

              const text = getMessageText(msg);

              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] shadow-sm ${
                      isUser ? "bg-primary text-white" : "bg-secondary-container text-on-secondary-container border border-outline/5"
                    }`}
                  >
                    {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 text-[11px] leading-relaxed max-w-[85%] font-medium ${
                      isUser
                        ? "rounded-tr-none bg-primary text-primary-foreground"
                        : "rounded-tl-none bg-surface-container text-foreground border border-outline/5"
                    } ${isStreaming ? "ring-1 ring-primary/25" : ""}`}
                  >
                    <div className="relative">
                      <p className="whitespace-pre-wrap">{text}</p>
                      {isStreaming && !text && (
                        <div className="flex gap-1 mt-1">
                          <span className="h-1 w-1 animate-bounce rounded-full bg-current/40 [animation-delay:0ms]" />
                          <span className="h-1 w-1 animate-bounce rounded-full bg-current/40 [animation-delay:150ms]" />
                          <span className="h-1 w-1 animate-bounce rounded-full bg-current/40 [animation-delay:300ms]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Error display inside message list */}
            {chatError && (
              <div className="flex gap-2 items-start bg-rose-500/10 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl border border-rose-500/20 text-[10px]">
                <div className="flex-1 font-semibold">{chatError}</div>
                <button
                  type="button"
                  onClick={() => {
                    setChatError(null);
                    sendMessage();
                  }}
                  className="underline font-bold shrink-0 hover:opacity-80"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Typing indicator (when initial response chunk is loading) */}
            {isLoading && messages[messages.length - 1]?.role === "user" && !chatError && (
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container border border-outline/5 shadow-sm">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="rounded-xl rounded-tl-none bg-surface-container px-2.5 py-1.5 border border-outline/5 shadow-sm">
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-on-secondary-container/40 mr-1" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-on-secondary-container/40 mr-1 [animation-delay:150ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-on-secondary-container/40 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Vibe, worry or thought..."
          className="min-w-0 flex-1 rounded-full border border-outline/5 bg-surface-container-low px-4 py-2 text-xs text-foreground outline-none placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 font-medium"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-md active-tactile disabled:opacity-40"
        >
          <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}
