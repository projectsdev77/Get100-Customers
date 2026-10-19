"use client";

import { useEffect } from "react";
import { saveDetectedTimezone } from "./timezone-actions";

// Rendered only while the founder has no saved timezone; reports the
// browser's once so daily emails land in their morning, not ours.
export function TimezoneSync() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) void saveDetectedTimezone(timeZone);
  }, []);
  return null;
}
