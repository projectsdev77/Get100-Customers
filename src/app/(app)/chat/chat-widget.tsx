"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmSwap, sendMessage } from "./actions";

interface Message {
  role: "user" | "model";
  text: string;
  proposedSwapQuestId?: string | null;
  proposedSwapReason?: string | null;
  swapResolved?: boolean;
}

// Persistent secondary chat surface (SPEC §10) — a bubble/panel, never the
// primary UI. Not persisted server-side; history lives for the tab session
// only, which is enough for a "why did you recommend this?" Q&A surface.
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    const nextMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(nextMessages);

    startTransition(async () => {
      const result = await sendMessage(
        nextMessages.map((m) => ({ role: m.role, text: m.text })),
        text,
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: result.reply,
          proposedSwapQuestId: result.proposedSwapQuestId,
          proposedSwapReason: result.proposedSwapReason,
        },
      ]);
    });
  }

  function handleConfirmSwap(index: number, questId: string, reason: string | null) {
    startTransition(async () => {
      await confirmSwap(questId, reason);
      setMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, swapResolved: true } : m)),
      );
      router.refresh();
    });
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col rounded border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <p className="text-sm font-medium text-black dark:text-zinc-50">Ask your coach</p>
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Ask about a quest, or why something was recommended.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <p
                  className={`inline-block rounded px-2.5 py-1.5 text-sm ${
                    m.role === "user"
                      ? "bg-black text-white dark:bg-zinc-50 dark:text-black"
                      : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  }`}
                >
                  {m.text}
                </p>
                {m.proposedSwapQuestId && !m.swapResolved && (
                  <div className="mt-1">
                    <button
                      onClick={() =>
                        handleConfirmSwap(i, m.proposedSwapQuestId!, m.proposedSwapReason ?? null)
                      }
                      disabled={isPending}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs disabled:opacity-50 dark:border-zinc-700"
                    >
                      Swap this quest
                    </button>
                  </div>
                )}
                {m.swapResolved && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Swapped.</p>
                )}
              </div>
            ))}
            {isPending && <p className="text-sm text-zinc-400">Thinking…</p>}
          </div>

          <div className="flex gap-2 border-t border-zinc-200 p-2 dark:border-zinc-800">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a question…"
              className="flex-1 rounded border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              onClick={handleSend}
              disabled={isPending}
              className="rounded bg-black px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="rounded-full bg-black px-4 py-3 text-sm font-medium text-white shadow-lg dark:bg-zinc-50 dark:text-black"
      >
        {open ? "Close" : "Ask your coach"}
      </button>
    </div>
  );
}
