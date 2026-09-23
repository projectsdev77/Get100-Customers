"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmSwap, sendMessage } from "./actions";
import { Button, buttonClasses } from "@/components/ui/actions/Button";

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
export function ChatWidget({ restricted = false }: { restricted?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSend() {
    const text = input.trim();
    if (!text || restricted) return;
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
      setMessages((prev) => [
        ...prev.map((m, i) => (i === index ? { ...m, swapResolved: true } : m)),
        { role: "model", text: "Done. That quest is swapped." },
      ]);
      router.refresh();
    });
  }

  function handleKeep(index: number) {
    setMessages((prev) => [
      ...prev.map((m, i) => (i === index ? { ...m, swapResolved: true } : m)),
      { role: "model", text: "Sounds good. Keeping it as is." },
    ]);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Ask your coach"
        className="fixed right-5 bottom-5 z-10 flex h-[52px] items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-card shadow-float"
      >
        <span className="h-2 w-2 rounded-full bg-[#D6F36A]" />
        Ask your coach
      </button>
    );
  }

  return (
    <div className="fixed right-5 bottom-5 z-10 flex h-[460px] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-panel bg-card text-primary shadow-float">
      <div className="flex items-center justify-between px-4.5 py-4">
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Coach
        </span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-action-2 text-sm font-medium text-primary"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-3.5 pb-3.5">
        {restricted ? (
          <div className="rounded-tile bg-sunken px-3.5 py-2.5 text-sm text-primary">
            Chat is paused. Update your payment method in Billing to pick up where you left off.
          </div>
        ) : (
          <>
            {messages.length === 0 && (
              <p className="text-sm text-secondary">
                Ask about a quest, or why something was recommended.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex max-w-[85%] flex-col gap-2 ${
                  m.role === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                <div
                  className={`rounded-[18px] px-3.5 py-2.5 text-sm ${
                    m.role === "user" ? "bg-action text-action-fg" : "bg-sunken text-primary"
                  }`}
                >
                  {m.text}
                </div>
                {m.proposedSwapQuestId && !m.swapResolved && (
                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleConfirmSwap(i, m.proposedSwapQuestId!, m.proposedSwapReason ?? null)
                      }
                      disabled={isPending}
                    >
                      Swap this quest
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleKeep(i)}
                      disabled={isPending}
                    >
                      Keep it
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isPending && <p className="text-sm text-secondary">Thinking…</p>}
          </>
        )}
      </div>

      <div className="flex gap-2 border-t border-subtle p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={restricted}
          placeholder={restricted ? "Chat unavailable" : "Ask about a quest…"}
          className="h-9 flex-1 rounded-full border border-strong bg-card px-3.5 text-sm text-primary outline-none placeholder:text-secondary focus:border-accent disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          onClick={handleSend}
          disabled={isPending || restricted}
          className={buttonClasses("primary", "sm")}
        >
          Send
        </button>
      </div>
    </div>
  );
}
