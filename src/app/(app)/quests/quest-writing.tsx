"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/actions/Button";
import { requestNextQuest } from "./actions";

const POLL_MS = 4_000;
const GIVE_UP_MS = 120_000;

// Shown while the background refill (ensureQuestSlots) is writing the next
// quest. Re-fetches the page every few seconds so the quest appears on its
// own; this component unmounts as soon as it does. If it's taking unusually
// long, polling stops and the founder can ask for one directly.
export function QuestWriting({ message }: { message: string }) {
  const router = useRouter();
  const [round, setRound] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      if (Date.now() - started > GIVE_UP_MS) {
        clearInterval(id);
        setTimedOut(true);
        return;
      }
      router.refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [router, round]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-secondary">This is taking longer than usual.</p>
        <form
          action={requestNextQuest}
          onSubmit={() => {
            setTimedOut(false);
            setRound((r) => r + 1);
          }}
        >
          <Button type="submit" size="sm">
            Get my next quest
          </Button>
        </form>
      </div>
    );
  }

  return (
    <p className="flex items-center justify-center gap-2 text-sm text-secondary" role="status">
      <span className="inline-flex gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:200ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:400ms]" />
      </span>
      {message}
    </p>
  );
}
