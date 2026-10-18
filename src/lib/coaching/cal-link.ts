const USERNAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export type CalLinkResult =
  | { ok: true; link: string }
  | { ok: false; error: string };

// Accepts what an admin is likely to paste ("cal.com/jane", "https://www.cal.com/jane/")
// and normalizes it to https://cal.com/<username>. Only a profile link is
// accepted: a single-event link (cal.com/jane/30min) would hide the coach's
// other session types from founders. Mirrors the CHECK constraint on
// coaches.cal_link in schema.sql.
export function parseCalLink(input: string): CalLinkResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Paste the coach's Cal.com profile link." };

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return { ok: false, error: "That doesn't look like a link." };
  }

  const host = url.hostname.toLowerCase();
  if (host !== "cal.com" && host !== "www.cal.com") {
    return { ok: false, error: "Only cal.com links are supported." };
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { ok: false, error: "Include the coach's username, e.g. cal.com/jane." };
  }
  if (segments[0].toLowerCase() === "team") {
    return { ok: false, error: "Team links aren't supported. Use the coach's own profile link." };
  }
  if (segments.length > 1) {
    return {
      ok: false,
      error: `Use the profile link (cal.com/${segments[0]}), not a single-event link, so founders see every session type.`,
    };
  }
  if (!USERNAME.test(segments[0])) {
    return { ok: false, error: "That Cal.com username has characters Cal.com doesn't allow." };
  }

  return { ok: true, link: `https://cal.com/${segments[0]}` };
}

// The embed takes the path, not the full URL.
export function calUsername(link: string): string {
  return new URL(link).pathname.replace(/^\/+|\/+$/g, "");
}
