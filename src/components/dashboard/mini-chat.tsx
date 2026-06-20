"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send, Bot, User, Sparkles } from "lucide-react";

const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

export default function MiniChat() {
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: chatTransport,
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
    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  }

  function handleQuickAction(text: string) {
    sendMessage({ text });
  }

  function getMessageText(message: (typeof messages)[0]): string {
    if (!message.parts) return "";
    return message.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
  }

  return (
    <div
      id="dashboard-mini-chat"
      className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-xl"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <MessageCircle className="h-4.5 w-4.5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Quick Companion Chat</h3>
            <p className="text-[10px] text-slate-400">Vibe check with your AI peer</p>
          </div>
        </div>
      </div>

      {/* Message Area */}
      <div
        ref={scrollRef}
        className="mb-3 h-40 overflow-y-auto rounded-xl border border-slate-100/50 bg-slate-50/40 p-3"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="h-6 w-6 text-indigo-300 mb-1" />
            <p className="text-xs text-slate-500">Need a quick boost or stress relief?</p>
            <div className="mt-2 flex gap-1">
              <button
                type="button"
                onClick={() => handleQuickAction("Give me a quick 1-minute breathing exercise")}
                className="rounded-full bg-white border border-slate-150 px-2 py-0.5 text-[9px] text-indigo-500 hover:bg-indigo-50"
              >
                🌬️ Breath
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction("I am feeling exam self-doubt right now")}
                className="rounded-full bg-white border border-slate-150 px-2 py-0.5 text-[9px] text-indigo-500 hover:bg-indigo-50"
              >
                💡 Support
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const text = getMessageText(msg);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] ${
                      isUser ? "bg-indigo-400 text-white" : "border border-slate-200 bg-white text-slate-400"
                    }`}
                  >
                    {isUser ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div
                    className={`rounded-xl px-2.5 py-1.5 text-xs leading-relaxed max-w-[85%] ${
                      isUser
                        ? "rounded-tr-none bg-indigo-400 text-white"
                        : "rounded-tl-none border border-white/50 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{text}</p>
                  </div>
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="rounded-xl rounded-tl-none border border-white/50 bg-white px-2.5 py-1.5 shadow-sm">
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-350 mr-1" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-350 mr-1 [animation-delay:150ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-350 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Vibe, worry or thought..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200/80 bg-white/40 px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-300"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-400 text-white transition-all hover:bg-indigo-500 disabled:opacity-40"
        >
          <Send className="h-3 w-3" />
        </button>
      </form>
    </div>
  );
}
