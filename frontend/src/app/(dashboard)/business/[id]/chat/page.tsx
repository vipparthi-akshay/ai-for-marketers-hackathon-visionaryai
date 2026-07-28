"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/uiStore";
import { MessageSquare, Trash2, Sparkles, Copy, Download } from "lucide-react";
import { copyToClipboard } from "@/lib/export";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

const quickPrompts = [
  "What marketing channels should I focus on?",
  "Help me write an Instagram post",
  "Analyze my competitors",
  "Suggest SEO improvements",
  "Create a content calendar plan",
  "What's my best performing content type?",
  "Help me write an email campaign",
  "Suggest ad copy for Google Ads",
];

export default function ChatPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    loadHistory();
  }, [businessId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const data = await api.chat.history(businessId);
      if (data?.messages && data.messages.length > 0) {
        setMessages(
          data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    const streamingMsg: Message = { role: "assistant", content: "", isStreaming: true };
    setMessages((prev) => [...prev, streamingMsg]);

    try {
      const response = await api.requestStream("/api/v1/chat", {
        method: "POST",
        body: {
          business_id: businessId,
          message: userMsg.content,
          context: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        },
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.isStreaming) {
              updated[updated.length - 1] = { ...last, content: fullContent };
            }
            return updated;
          });
        }
      } else {
        const data = await response.json();
        fullContent = data.response || data.message || "I couldn't process that request.";
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.isStreaming) {
            updated[updated.length - 1] = { ...last, content: fullContent };
          }
          return updated;
        });
      }

      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.isStreaming) {
          updated[updated.length - 1] = { ...last, isStreaming: false };
        }
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (updated[lastIdx]?.isStreaming) {
          updated[lastIdx] = {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            isStreaming: false,
          };
        }
        return updated;
      });
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.chat.clearHistory(businessId);
      setMessages([]);
      addToast("Chat history cleared", "success");
    } catch (err) {
      addToast("Failed to clear history", "error");
    }
  };

  const handleCopyMessage = async (content: string) => {
    await copyToClipboard(content);
    addToast("Copied to clipboard", "success");
  };

  return (
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">AI Marketing Assistant</h2>
            <p className="text-muted-foreground">
              Context-aware assistant that knows your business
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Sparkles className="h-3 w-3" /> Streaming enabled
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-border bg-card p-4 mb-4">
          {!historyLoaded ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-pulse text-muted-foreground">Loading conversation...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">How can I help?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                I know your business and can help with strategy, content, SEO,
                and more. Ask me anything!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-lg">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                    className="p-3 rounded-lg border border-border text-xs text-left text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content || (msg.isStreaming ? "..." : "")}</p>
                    {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                      <div className="mt-2 flex items-center gap-1">
                        <button
                          onClick={() => handleCopyMessage(msg.content)}
                          className="p-1 rounded hover:bg-background/50 transition-colors"
                          title="Copy"
                        >
                          <Copy className="h-3 w-3 opacity-50 hover:opacity-100" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none min-h-[48px] max-h-[120px]"
            placeholder="Ask about your marketing..."
            disabled={sending}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 self-end"
          >
            Send
          </button>
        </div>
      </div>
  );
}
