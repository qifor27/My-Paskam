import "server-only";

import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";

// Generator PDF laporan (PRD §17, ADR-020). pdf-lib murni JS: tanpa modul native
// dan tanpa file font eksternal (font standar Helvetica, encoding WinAnsi).

const A4_LANDSCAPE: [number, number] = [841.89, 595.28];
const M = 36; // margin
const C = {
  brand: rgb(0x25 / 255, 0x63 / 255, 0xeb / 255),
  ink: rgb(0x0f / 255, 0x17 / 255, 0x2a / 255),
  muted: rgb(0x47 / 255, 0x55 / 255, 0x69 / 255),
  border: rgb(0xe5 / 255, 0xe9 / 255, 0xf2 / 255),
  head: rgb(0xee / 255, 0xf4 / 255, 0xff / 255),
  zebra: rgb(0xf7 / 255, 0xf9 / 255, 0xfc / 255),
};

export type Column = { header: string; width: number; align?: "left" | "right" };
export type ReportSection =
  | { kind: "summary"; items: { label: string; value: string }[] }
  | { kind: "table"; title: string; columns: Column[]; rows: string[][]; note?: string };

export type ReportInput = {
  title: string;
  subtitle: string;
  filters: string[];
  printedBy: string;
  printedAt: string;
  sections: ReportSection[];
};

export async function renderReportPdf(input: ReportInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${input.title} — My PASKAM`);
  doc.setAuthor("My PASKAM");
  doc.setCreator("My PASKAM");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(doc, regular, bold);

  w.header(input);
  for (const section of input.sections) {
    if (section.kind === "summary") w.summary(section.items);
    else w.table(section);
  }
  w.footers(input.title);
  return doc.save();
}

/** Ganti karakter di luar WinAnsi (mis. emoji) agar font standar tidak gagal. */
function safe(font: PDFFont, text: string): string {
  let out = "";
  for (const ch of text.replace(/[\r\t]/g, " ")) {
    try {
      font.encodeText(ch);
      out += ch;
    } catch {
      out += "?";
    }
  }
  return out;
}

class Writer {
  page!: PDFPage;
  y = 0;
  private readonly width = A4_LANDSCAPE[0] - M * 2;

  constructor(
    private doc: PDFDocument,
    private regular: PDFFont,
    private bold: PDFFont,
  ) {
    this.newPage();
  }

  private newPage() {
    this.page = this.doc.addPage(A4_LANDSCAPE);
    this.y = A4_LANDSCAPE[1] - M;
  }

  private ensure(height: number) {
    if (this.y - height < M + 24) {
      this.newPage();
      return true;
    }
    return false;
  }

  private text(s: string, x: number, size: number, opts: { font?: PDFFont; color?: ReturnType<typeof rgb> } = {}) {
    const font = opts.font ?? this.regular;
    this.page.drawText(safe(font, s), { x, y: this.y, size, font, color: opts.color ?? C.ink });
  }

  /** Pecah teks menjadi baris yang muat di lebar tertentu. */
  private wrap(s: string, font: PDFFont, size: number, max: number): string[] {
    const words = safe(font, s).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= max) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // Kata lebih panjang dari kolom: potong per karakter.
      let rest = word;
      while (font.widthOfTextAtSize(rest, size) > max) {
        let i = rest.length;
        while (i > 1 && font.widthOfTextAtSize(rest.slice(0, i), size) > max) i--;
        lines.push(rest.slice(0, i));
        rest = rest.slice(i);
      }
      line = rest;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  header(input: ReportInput) {
    this.page.drawRectangle({ x: M, y: this.y - 4, width: 28, height: 4, color: C.brand });
    this.y -= 22;
    this.text("My PASKAM", M, 10, { font: this.bold, color: C.brand });
    this.y -= 22;
    this.text(input.title, M, 18, { font: this.bold });
    const printed = `Dicetak ${input.printedAt} oleh ${input.printedBy}`;
    const pw = this.regular.widthOfTextAtSize(safe(this.regular, printed), 8.5);
    this.page.drawText(safe(this.regular, printed), { x: M + this.width - pw, y: this.y + 4, size: 8.5, font: this.regular, color: C.muted });
    this.y -= 16;
    this.text(input.subtitle, M, 10, { color: C.muted });
    if (input.filters.length) {
      this.y -= 14;
      this.text(`Filter: ${input.filters.join(" · ")}`, M, 9, { color: C.muted });
    }
    this.y -= 18;
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: M + this.width, y: this.y }, thickness: 0.75, color: C.border });
    this.y -= 14;
  }

  summary(items: { label: string; value: string }[]) {
    const h = 46;
    this.ensure(h + 10);
    const boxW = this.width / items.length;
    items.forEach((item, i) => {
      const x = M + i * boxW;
      this.page.drawRectangle({ x, y: this.y - h, width: boxW - 8, height: h, borderColor: C.border, borderWidth: 0.75, color: rgb(1, 1, 1) });
      this.page.drawText(safe(this.regular, item.label), { x: x + 10, y: this.y - 16, size: 8.5, font: this.regular, color: C.muted });
      this.page.drawText(safe(this.bold, item.value), { x: x + 10, y: this.y - 36, size: 16, font: this.bold, color: C.ink });
    });
    this.y -= h + 18;
  }

  table(section: Extract<ReportSection, { kind: "table" }>) {
    const size = 8.5;
    const pad = 5;
    const lineH = 11;
    const total = section.columns.reduce((a, c) => a + c.width, 0);
    const widths = section.columns.map((c) => (c.width / total) * this.width);

    const drawHeader = () => {
      const h = lineH + pad * 2;
      this.page.drawRectangle({ x: M, y: this.y - h, width: this.width, height: h, color: C.head });
      let x = M;
      section.columns.forEach((col, i) => {
        const label = safe(this.bold, col.header);
        const tw = this.bold.widthOfTextAtSize(label, size);
        const tx = col.align === "right" ? x + widths[i]! - pad - tw : x + pad;
        this.page.drawText(label, { x: tx, y: this.y - pad - 8.5, size, font: this.bold, color: C.muted });
        x += widths[i]!;
      });
      this.y -= h;
    };

    this.ensure(60);
    this.text(section.title, M, 11, { font: this.bold });
    this.y -= 10;
    if (section.note) {
      this.text(section.note, M, 8.5, { color: C.muted });
      this.y -= 10;
    }
    drawHeader();

    section.rows.forEach((row, r) => {
      const cells = row.map((v, i) => this.wrap(v, this.regular, size, widths[i]! - pad * 2));
      const h = Math.max(...cells.map((c) => c.length)) * lineH + pad * 2 - 2;
      if (this.ensure(h)) drawHeader(); // header tabel diulang di halaman baru
      if (r % 2 === 1) this.page.drawRectangle({ x: M, y: this.y - h, width: this.width, height: h, color: C.zebra });
      let x = M;
      cells.forEach((lines, i) => {
        lines.forEach((line, li) => {
          const tw = this.regular.widthOfTextAtSize(line, size);
          const tx = section.columns[i]!.align === "right" ? x + widths[i]! - pad - tw : x + pad;
          this.page.drawText(line, { x: tx, y: this.y - pad - 8 - li * lineH, size, font: this.regular, color: C.ink });
        });
        x += widths[i]!;
      });
      this.y -= h;
      this.page.drawLine({ start: { x: M, y: this.y }, end: { x: M + this.width, y: this.y }, thickness: 0.5, color: C.border });
    });
    this.y -= 20;
  }

  footers(title: string) {
    const pages = this.doc.getPages();
    pages.forEach((p, i) => {
      const label = safe(this.regular, `My PASKAM · ${title}`);
      const num = `Halaman ${i + 1} dari ${pages.length}`;
      p.drawText(label, { x: M, y: M - 12, size: 8, font: this.regular, color: C.muted });
      const nw = this.regular.widthOfTextAtSize(num, 8);
      p.drawText(num, { x: A4_LANDSCAPE[0] - M - nw, y: M - 12, size: 8, font: this.regular, color: C.muted });
    });
  }
}
