"use client";

import { useEffect } from "react";
import { markOthersRead } from "./actions";

// Fires once when the notifications page mounts, marking every
// non-quest-linked notification read without a visible button. This has to
// be a client effect calling a Server Action (rather than a write inside
// the page's own server-side render) so that action can legally call
// revalidatePath to refresh the TopNav badge — see actions.ts.
export function AutoMarkRead({ ids }: { ids: string[] }) {
  useEffect(() => {
    if (ids.length > 0) {
      markOthersRead(ids);
    }
    // Intentionally run only once per mount, against the ids this page
    // load was rendered with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
