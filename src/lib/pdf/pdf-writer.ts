import { PDFDocument, type PDFFont, type PDFPage, type RGB, StandardFonts, rgb } from "pdf-lib";

// Minimal flowing-text PDF layout on top of pdf-lib, which (unlike
// pdfkit) has no built-in text wrapping or auto-pagination — every line's
// position has to be tracked and overflow handled by hand. Chosen over
// pdfkit specifically because pdfkit reads its standard-font metrics from
// .afm files on disk at runtime, which routinely go missing from a
// Vercel serverless function's trace bundle; pdf-lib's StandardFonts are
// pure JS with no disk reads, so there's nothing to leave out of the
// deployed bundle.
const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const LINE_GAP = 4;
const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
const COVER_HEIGHT = 118;

// Coach Violet + Lime (src/app/tokens/colors.css light theme), ported to
// pdf-lib's 0-1 RGB so the export reads as this app's document, not a
// generic data dump.
export const PdfColors = {
  accent: rgb(0x5b / 255, 0x4b / 255, 0xc4 / 255), // --violet-600
  accentSoft: rgb(0xdc / 255, 0xd6 / 255, 0xf7 / 255), // --violet-200
  canvasSoft: rgb(0xee / 255, 0xed / 255, 0xf2 / 255), // --violet-100
  ink: rgb(0x1a / 255, 0x16 / 255, 0x33 / 255), // --ink-900
  secondary: rgb(0x6a / 255, 0x65 / 255, 0x83 / 255), // --ink-600
  border: rgb(0xe2 / 255, 0xe0 / 255, 0xea / 255), // --border-subtle
  green: rgb(0x1f / 255, 0x9d / 255, 0x55 / 255), // --green-600
  rose: rgb(0xb8 / 255, 0x3a / 255, 0x2b / 255), // --rose-600
  white: rgb(1, 1, 1),
} as const;

// pdf-lib's standard fonts only support WinAnsi (cp1252) encoding and throw
// if asked to draw anything outside it — not just emoji, but any non-Latin
// script (CJK, Cyrillic, Arabic, Turkish "ı", etc). This data is free text a
// founder typed (name, company, product description, notes), so it can
// contain any of that; replacing unencodable characters keeps the export
// from crashing on real-world input.
//
// cp1252's 0x80-0x9F range maps to these *Unicode* code points (not the
// byte values themselves — e.g. an em dash in a JS string is U+2014, not
// 0x97) — confirmed directly against pdf-lib's WinAnsi support.
const WINANSI_EXTRA_CODEPOINTS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
  0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
  0x0153, 0x017e, 0x0178,
]);
// Visually-equivalent punctuation that AI-generated text favors but cp1252
// has no slot for (various Unicode hyphen/dash/prime variants) — normalized
// to their plain-ASCII look-alike instead of falling through to "?".
const PUNCTUATION_LOOKALIKES: Record<number, string> = {
  0x2010: "-", // hyphen
  0x2011: "-", // non-breaking hyphen
  0x2012: "-", // figure dash
  0x2015: "-", // horizontal bar
  0x2212: "-", // minus sign
  0x2032: "'", // prime
  0x2033: '"', // double prime
  0x200b: "", // zero-width space
  0xfeff: "", // zero-width no-break space / BOM
};
function sanitizeForPdf(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      if (code === 0x09 || code === 0x0a || code === 0x0d) return char;
      if (code >= 0x20 && code <= 0x7e) return char;
      if (code >= 0xa0 && code <= 0xff) return char;
      if (WINANSI_EXTRA_CODEPOINTS.has(code)) return char;
      if (code in PUNCTUATION_LOOKALIKES) return PUNCTUATION_LOOKALIKES[code];
      return "?";
    })
    .join("");
}

interface TextOptions {
  bold?: boolean;
  size?: number;
  color?: RGB;
}

export class PdfWriter {
  private doc: PDFDocument;
  private page: PDFPage;
  private font: PDFFont;
  private boldFont: PDFFont;
  private y: number;
  private runningTitle: string;

  private constructor(doc: PDFDocument, font: PDFFont, boldFont: PDFFont, runningTitle: string) {
    this.doc = doc;
    this.font = font;
    this.boldFont = boldFont;
    this.runningTitle = runningTitle;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  static async create(runningTitle: string): Promise<PdfWriter> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    return new PdfWriter(doc, font, boldFont, runningTitle);
  }

  private newPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
    this.page.drawText(sanitizeForPdf(this.runningTitle), {
      x: MARGIN,
      y: this.y - 7,
      size: 8,
      font: this.boldFont,
      color: PdfColors.accent,
    });
    this.page.drawLine({
      start: { x: MARGIN, y: this.y - 14 },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y - 14 },
      thickness: 0.75,
      color: PdfColors.border,
    });
    this.y -= 28;
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN) this.newPage();
  }

  private truncateToWidth(text: string, font: PDFFont, size: number, maxWidth: number): string {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
    let result = text;
    while (result.length > 1 && font.widthOfTextAtSize(`${result}…`, size) > maxWidth) {
      result = result.slice(0, -1);
    }
    return `${result}…`;
  }

  private wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        lines.push("");
        continue;
      }
      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
      }
      if (current) lines.push(current);
    }
    return lines;
  }

  /** Cover band on the first page: title, subtitle, and meta lines in reverse (white-on-accent). */
  coverHeader(title: string, subtitle: string, meta: string[]) {
    this.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - COVER_HEIGHT,
      width: PAGE_WIDTH,
      height: COVER_HEIGHT,
      color: PdfColors.accent,
    });
    this.page.drawText("GET100-CUSTOMERS", {
      x: MARGIN,
      y: PAGE_HEIGHT - 32,
      size: 10,
      font: this.boldFont,
      color: PdfColors.accentSoft,
    });
    this.page.drawText(this.truncateToWidth(sanitizeForPdf(title), this.boldFont, 22, MAX_WIDTH), {
      x: MARGIN,
      y: PAGE_HEIGHT - 60,
      size: 22,
      font: this.boldFont,
      color: PdfColors.white,
    });
    this.page.drawText(this.truncateToWidth(sanitizeForPdf(subtitle), this.font, 11, MAX_WIDTH), {
      x: MARGIN,
      y: PAGE_HEIGHT - 80,
      size: 11,
      font: this.font,
      color: PdfColors.accentSoft,
    });
    let metaY = PAGE_HEIGHT - 100;
    for (const line of meta) {
      this.page.drawText(this.truncateToWidth(sanitizeForPdf(line), this.font, 9, MAX_WIDTH), {
        x: MARGIN,
        y: metaY,
        size: 9,
        font: this.font,
        color: PdfColors.accentSoft,
      });
      metaY -= 12;
    }
    this.y = PAGE_HEIGHT - COVER_HEIGHT - 26;
  }

  /** A row of up to 4 snapshot tiles (e.g. customers, level, XP, streak). */
  statGrid(items: Array<{ label: string; value: string }>) {
    const gap = 10;
    const tileHeight = 46;
    const tileWidth = (MAX_WIDTH - gap * (items.length - 1)) / items.length;
    this.ensureSpace(tileHeight + 18);
    const topY = this.y;
    items.forEach((item, i) => {
      const x = MARGIN + i * (tileWidth + gap);
      this.page.drawRectangle({
        x,
        y: topY - tileHeight,
        width: tileWidth,
        height: tileHeight,
        color: PdfColors.canvasSoft,
        borderColor: PdfColors.border,
        borderWidth: 1,
      });
      this.page.drawText(this.truncateToWidth(sanitizeForPdf(item.value), this.boldFont, 16, tileWidth - 16), {
        x: x + 10,
        y: topY - 22,
        size: 16,
        font: this.boldFont,
        color: PdfColors.accent,
      });
      this.page.drawText(
        this.truncateToWidth(sanitizeForPdf(item.label).toUpperCase(), this.font, 8, tileWidth - 16),
        { x: x + 10, y: topY - 36, size: 8, font: this.font, color: PdfColors.secondary },
      );
    });
    this.y = topY - tileHeight - 18;
  }

  /** A label/value row for short scalar fields — keeps the profile section scannable. */
  keyValue(fieldLabel: string, value: string) {
    const size = 10;
    const labelWidth = 150;
    const lineHeight = size + LINE_GAP + 2;
    const valueLines = this.wrap(sanitizeForPdf(value), this.font, size, MAX_WIDTH - labelWidth);
    valueLines.forEach((line, i) => {
      this.ensureSpace(lineHeight);
      if (i === 0) {
        this.page.drawText(sanitizeForPdf(fieldLabel), {
          x: MARGIN,
          y: this.y - size,
          size,
          font: this.boldFont,
          color: PdfColors.secondary,
        });
      }
      this.page.drawText(line, {
        x: MARGIN + labelWidth,
        y: this.y - size,
        size,
        font: this.font,
        color: PdfColors.ink,
      });
      this.y -= lineHeight;
    });
  }

  text(content: string, { bold = false, size = 10, color }: TextOptions = {}) {
    const font = bold ? this.boldFont : this.font;
    const lineHeight = size + LINE_GAP;
    for (const line of this.wrap(sanitizeForPdf(content), font, size, MAX_WIDTH)) {
      this.ensureSpace(lineHeight);
      if (line) {
        this.page.drawText(line, {
          x: MARGIN,
          y: this.y - size,
          size,
          font,
          color: color ?? PdfColors.ink,
        });
      }
      this.y -= lineHeight;
    }
  }

  /** A wrapped line with a small colored dot — for working/not-working style lists. */
  bullet(content: string, { color = PdfColors.ink, size = 10 }: { color?: RGB; size?: number } = {}) {
    const indent = 14;
    const lineHeight = size + LINE_GAP;
    const lines = this.wrap(sanitizeForPdf(content), this.font, size, MAX_WIDTH - indent);
    lines.forEach((line, i) => {
      this.ensureSpace(lineHeight);
      if (i === 0) {
        this.page.drawCircle({ x: MARGIN + 3, y: this.y - size * 0.68, size: 2.5, color });
      }
      if (line) {
        this.page.drawText(line, {
          x: MARGIN + indent,
          y: this.y - size,
          size,
          font: this.font,
          color: PdfColors.ink,
        });
      }
      this.y -= lineHeight;
    });
  }

  heading(content: string) {
    this.spacer(16);
    this.ensureSpace(28);
    this.text(content, { bold: true, size: 14, color: PdfColors.accent });
    this.spacer(2);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y },
      thickness: 1,
      color: PdfColors.accentSoft,
    });
    this.spacer(8);
  }

  subheading(content: string) {
    this.spacer(6);
    this.text(content, { bold: true, size: 11 });
    this.spacer(2);
  }

  /**
   * Runs render() after reserving minHeight of vertical space, so a short
   * multi-line item (a quest's title + meta lines) starts fresh on the next
   * page as a whole instead of splitting mid-item with an orphaned line at
   * the top of the following page.
   */
  item(minHeight: number, render: () => void) {
    this.ensureSpace(minHeight);
    render();
  }

  /** A light hairline between repeated list entries (quests, events, documents). */
  itemDivider() {
    this.spacer(4);
    this.ensureSpace(1);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y },
      thickness: 0.5,
      color: PdfColors.border,
    });
    this.spacer(8);
  }

  spacer(amount = 8) {
    this.y -= amount;
  }

  async save(): Promise<Uint8Array> {
    const pages = this.doc.getPages();
    const total = pages.length;
    pages.forEach((page, i) => {
      page.drawText("Get100-Customers", {
        x: MARGIN,
        y: 24,
        size: 8,
        font: this.font,
        color: PdfColors.secondary,
      });
      const pageLabel = `Page ${i + 1} of ${total}`;
      const width = this.font.widthOfTextAtSize(pageLabel, 8);
      page.drawText(pageLabel, {
        x: PAGE_WIDTH - MARGIN - width,
        y: 24,
        size: 8,
        font: this.font,
        color: PdfColors.secondary,
      });
    });
    return this.doc.save();
  }
}
