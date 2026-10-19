// Shared layout for every email the app sends. Email clients (Outlook
// especially) ignore most modern CSS, so this is table-based with inline
// styles; the <style> block only adds mobile padding and dark-mode colors
// for the clients that support them. Every piece of text is HTML-escaped
// here, so callers pass plain strings.

const COLORS = {
  canvas: "#EEEDF2",
  card: "#FFFFFF",
  ink: "#1A1633",
  body: "#6A6583",
  muted: "#9E9AB3",
  accent: "#5B4BC4",
  panelViolet: "#DCD6F7",
  panelLime: "#E3F1B5",
  questBg: "#F6F5FA",
  border: "#E4E2EC",
};

const FONT = "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface EmailImage {
  file: string;
  alt: string;
  wide?: boolean;
  tone?: "violet" | "lime";
}

export interface EmailQuest {
  title: string;
  details?: string[];
}

export interface EmailStat {
  value: string;
  label: string;
}

export interface EmailContent {
  preheader: string;
  eyebrow?: string;
  title: string;
  greeting?: string | null;
  paragraphs: string[];
  image?: EmailImage;
  quest?: EmailQuest;
  stats?: EmailStat[];
  button?: { label: string; path: string };
  reason: string;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function appUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? ""}${path}`;
}

function imageBlock(image: EmailImage): string {
  const panel = image.tone === "lime" ? COLORS.panelLime : COLORS.panelViolet;
  const width = image.wide ? 440 : 180;
  const height = image.wide ? 187 : 180;
  return `
<tr><td style="padding:0 0 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" class="panel" style="background:${panel};border-radius:20px;padding:${image.wide ? "20px 16px 0 16px" : "24px 16px"};">
      <img src="${escapeHtml(appUrl(`/email/${image.file}`))}" width="${width}" height="${height}" alt="${escapeHtml(image.alt)}"
        style="display:block;width:100%;max-width:${width}px;height:auto;border:0;outline:none;text-decoration:none;">
    </td>
  </tr></table>
</td></tr>`;
}

function questBlock(quest: EmailQuest): string {
  const details = (quest.details ?? [])
    .map(
      (line) =>
        `<p class="body" style="margin:6px 0 0 0;font-family:${FONT};font-size:14px;line-height:1.5;color:${COLORS.body};">${escapeHtml(line)}</p>`,
    )
    .join("");
  return `
<tr><td style="padding:0 0 24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
    <td class="quest" style="background:${COLORS.questBg};border:1px solid ${COLORS.border};border-radius:16px;padding:18px 20px;text-align:left;">
      <p class="eyebrow" style="margin:0 0 6px 0;font-family:${FONT};font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.accent};">Your quest</p>
      <p class="ink" style="margin:0;font-family:${FONT};font-size:17px;font-weight:600;line-height:1.35;color:${COLORS.ink};">${escapeHtml(quest.title)}</p>
      ${details}
    </td>
  </tr></table>
</td></tr>`;
}

function statsBlock(stats: EmailStat[]): string {
  const cells = stats
    .map(
      (stat) => `
    <td class="stat" align="center" valign="top" style="padding:14px 6px;background:${COLORS.questBg};border-radius:14px;">
      <p class="ink" style="margin:0;font-family:${FONT};font-size:22px;font-weight:600;line-height:1.1;color:${COLORS.ink};">${escapeHtml(stat.value)}</p>
      <p class="body" style="margin:4px 0 0 0;font-family:${FONT};font-size:12px;line-height:1.3;color:${COLORS.body};">${escapeHtml(stat.label)}</p>
    </td>`,
    )
    .join(`<td width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td>`);
  return `
<tr><td style="padding:0 0 28px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr>${cells}</tr></table>
</td></tr>`;
}

function buttonBlock(button: { label: string; path: string }): string {
  return `
<tr><td align="center" style="padding:4px 0 8px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" bgcolor="${COLORS.accent}" style="border-radius:999px;background:${COLORS.accent};">
      <a href="${escapeHtml(appUrl(button.path))}" target="_blank"
        style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:16px;font-weight:600;line-height:1;color:#FFFFFF;text-decoration:none;border-radius:999px;">${escapeHtml(button.label)}</a>
    </td>
  </tr></table>
</td></tr>`;
}

export function renderEmail(content: EmailContent): string {
  const paragraphs = [content.greeting, ...content.paragraphs]
    .filter((p): p is string => Boolean(p && p.trim()))
    .map(
      (p) =>
        `<p class="body" style="margin:0 0 14px 0;font-family:${FONT};font-size:16px;line-height:1.6;color:${COLORS.body};">${escapeHtml(p)}</p>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(content.title)}</title>
<style>
  @media only screen and (max-width: 600px) {
    .outer { padding: 20px 10px !important; }
    .card { padding: 28px 20px !important; border-radius: 20px !important; }
    .title { font-size: 24px !important; }
  }
  @media (prefers-color-scheme: dark) {
    .canvas, .outer { background: #0F0E16 !important; }
    .card { background: #1B1A25 !important; }
    .ink, .title, .brand { color: #F3F2F8 !important; }
    .body { color: #B9B5CC !important; }
    .quest, .stat { background: #24222F !important; border-color: #33303F !important; }
    .panel { background: #2A2836 !important; }
    .eyebrow, .link { color: #A99CFF !important; }
  }
</style>
</head>
<body class="canvas" style="margin:0;padding:0;background:${COLORS.canvas};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(content.preheader)}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="canvas" style="background:${COLORS.canvas};">
<tr><td align="center" class="outer" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
    <tr><td align="center" style="padding:0 0 20px 0;">
      <a href="${escapeHtml(appUrl("/dashboard"))}" target="_blank" class="brand" style="font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:-0.01em;color:${COLORS.ink};text-decoration:none;">
        <span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:#D6F36A;margin-right:8px;vertical-align:middle;"></span>Get100-Customers
      </a>
    </td></tr>
    <tr><td class="card" style="background:${COLORS.card};border-radius:24px;padding:40px 36px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${content.image ? imageBlock(content.image) : ""}
        ${
          content.eyebrow
            ? `<tr><td align="center" style="padding:0 0 10px 0;"><p class="eyebrow" style="margin:0;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.accent};">${escapeHtml(content.eyebrow)}</p></td></tr>`
            : ""
        }
        <tr><td align="center" style="padding:0 0 16px 0;">
          <h1 class="title" style="margin:0;font-family:${FONT};font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-0.02em;color:${COLORS.ink};">${escapeHtml(content.title)}</h1>
        </td></tr>
        <tr><td align="center" style="padding:0 0 10px 0;text-align:center;">${paragraphs}</td></tr>
        ${content.quest ? questBlock(content.quest) : ""}
        ${content.stats?.length ? statsBlock(content.stats) : ""}
        ${content.button ? buttonBlock(content.button) : ""}
      </table>
    </td></tr>
    <tr><td align="center" style="padding:24px 12px 0 12px;">
      <p style="margin:0 0 8px 0;font-family:${FONT};font-size:13px;line-height:1.5;color:${COLORS.muted};">${escapeHtml(content.reason)}</p>
      <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.5;color:${COLORS.muted};">
        <a href="${escapeHtml(appUrl("/settings?tab=notifications"))}" target="_blank" class="link" style="color:${COLORS.accent};text-decoration:underline;">Notification settings</a>
        &nbsp;&middot;&nbsp; Get100-Customers
      </p>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}
