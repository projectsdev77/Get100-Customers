import { PDFDocument, type PDFFont, type PDFPage, StandardFonts, rgb } from "pdf-lib";

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

interface TextOptions {
  bold?: boolean;
  size?: number;
  color?: readonly [number, number, number];
}

// pdf-lib's standard fonts only support WinAnsi (cp1252) encoding and throw
// if asked to draw anything outside it — not just emoji, but any non-Latin
// script (CJK, Cyrillic, Arabic, Turkish "ı", etc). This data is free text a
// founder typed (name, company, product description, notes, admin
// messages), so it can contain any of that; replacing unencodable
// characters keeps the export from crashing on real-world input.
const WINANSI_EXTRA_CODEPOINTS = new Set([
  0x80, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8e, 0x91, 0x92, 0x93,
  0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9e, 0x9f,
]);
function sanitizeForPdf(text: string): string {
  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      if (code === 0x09 || code === 0x0a || code === 0x0d) return char;
      if (code >= 0x20 && code <= 0x7e) return char;
      if (code >= 0xa0 && code <= 0xff) return char;
      if (WINANSI_EXTRA_CODEPOINTS.has(code)) return char;
      return "?";
    })
    .join("");
}

export class PdfWriter {
  private doc: PDFDocument;
  private page: PDFPage;
  private font: PDFFont;
  private boldFont: PDFFont;
  private y: number;

  private constructor(doc: PDFDocument, font: PDFFont, boldFont: PDFFont) {
    this.doc = doc;
    this.font = font;
    this.boldFont = boldFont;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  static async create(): Promise<PdfWriter> {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    return new PdfWriter(doc, font, boldFont);
  }

  private newPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensureSpace(height: number) {
    if (this.y - height < MARGIN) this.newPage();
  }

  private wrap(text: string, font: PDFFont, size: number): string[] {
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
        if (current && font.widthOfTextAtSize(candidate, size) > MAX_WIDTH) {
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

  text(content: string, { bold = false, size = 10, color }: TextOptions = {}) {
    const font = bold ? this.boldFont : this.font;
    const lineHeight = size + LINE_GAP;
    for (const line of this.wrap(sanitizeForPdf(content), font, size)) {
      this.ensureSpace(lineHeight);
      if (line) {
        this.page.drawText(line, {
          x: MARGIN,
          y: this.y - size,
          size,
          font,
          color: color ? rgb(...color) : rgb(0, 0, 0),
        });
      }
      this.y -= lineHeight;
    }
  }

  heading(content: string) {
    this.spacer(14);
    this.text(content, { bold: true, size: 16 });
    this.spacer(4);
  }

  subheading(content: string) {
    this.spacer(8);
    this.text(content, { bold: true, size: 12 });
    this.spacer(2);
  }

  spacer(amount = 8) {
    this.y -= amount;
  }

  divider() {
    this.ensureSpace(12);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y },
      thickness: 0.5,
      color: rgb(0.82, 0.82, 0.82),
    });
    this.spacer(12);
  }

  async save(): Promise<Uint8Array> {
    return this.doc.save();
  }
}
