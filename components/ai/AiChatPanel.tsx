"use client";

import { useState, useRef, useEffect } from "react";
import { readSseEvents } from "@/lib/ai/sse";
import { useCustomer } from "@/lib/customer-context";
import type { ViewType } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AiChatPanel({ view = "c-level" as ViewType }: { view?: ViewType }) {
  const { customer } = useCustomer();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [providerLabel, setProviderLabel] = useState("AI");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => {
    activeRequestRef.current?.abort();
  }, []);

  function createMessage(role: Message["role"], content: string): Message {
    return {
      id: crypto.randomUUID(),
      role,
      content,
    };
  }

  function appendAssistantChunk(messageId: string, chunk: string) {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, content: `${message.content}${chunk}` }
          : message,
      ),
    );
  }

  function replaceAssistantMessage(messageId: string, content: string) {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, content }
          : message,
      ),
    );
  }

  async function handleSend() {
    if (!input.trim() || !customer || sending) return;

    const question = input.trim();
    setInput("");
    const userMsg = createMessage("user", question);
    const assistantMsg = createMessage("assistant", "");
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setSending(true);

    try {
      const controller = new AbortController();
      activeRequestRef.current = controller;
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          customerId: customer.id,
          view,
          question,
          history,
          stream: true,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to get response");
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream") && res.body) {
        let receivedText = false;

        for await (const event of readSseEvents(res.body)) {
          if (event.event === "meta") {
            const data = JSON.parse(event.data) as { providerLabel?: string };
            setProviderLabel(data.providerLabel || "AI");
            continue;
          }

          if (event.event === "delta") {
            const data = JSON.parse(event.data) as { text?: string };
            if (data.text) {
              receivedText = true;
              appendAssistantChunk(assistantMsg.id, data.text);
            }
            continue;
          }

          if (event.event === "error") {
            replaceAssistantMessage(
              assistantMsg.id,
              "Sorry, I couldn't process your request. Please try again.",
            );
            receivedText = true;
          }
        }

        if (!receivedText) {
          replaceAssistantMessage(
            assistantMsg.id,
            "Sorry, I couldn't process your request. Please try again.",
          );
        }
      } else {
        const data = await res.json();
        setProviderLabel(data.providerLabel || "AI");
        replaceAssistantMessage(assistantMsg.id, data.answer);
      }
    } catch {
      replaceAssistantMessage(
        assistantMsg.id,
        "Sorry, I couldn't process your request. Please try again.",
      );
    } finally {
      activeRequestRef.current = null;
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 1 8 8c0 3.3-2 6.2-5 7.6V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.4C6 16.2 4 13.3 4 10a8 8 0 0 1 8-8z" />
          <line x1="10" y1="12" x2="10" y2="12.01" />
          <line x1="14" y1="12" x2="14" y2="12.01" />
        </svg>
        <span className="text-sm font-medium">Ask AI</span>
      </button>

      {/* Slide-out panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-[400px] max-h-[520px] bg-white dark:bg-[#1C1C27] rounded-xl border border-gray-200 dark:border-[#2E2E3D] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2E2E3D]">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                <path d="M12 2a8 8 0 0 1 8 8c0 3.3-2 6.2-5 7.6V20a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.4C6 16.2 4 13.3 4 10a8 8 0 0 1 8-8z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">AI Assistant</h3>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
            {messages.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-8">
                Ask a question about your dashboard data
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-[#262633] text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {msg.content || (sending ? <span className="animate-pulse text-gray-500">Thinking...</span> : null)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 dark:border-[#2E2E3D] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your infrastructure..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-[#2E2E3D] rounded-lg bg-white dark:bg-[#1C1C27] text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-center">
              Powered by {providerLabel}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
