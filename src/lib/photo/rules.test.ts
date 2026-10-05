import { describe, expect, it } from "vitest";

import { detectImageKind } from "./rules";

const bytes = (...b: number[]) => new Uint8Array(b);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("detectImageKind", () => {
  it("mengenali JPEG dan WebP dari isi file", () => {
    expect(detectImageKind(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpg");
    expect(detectImageKind(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBP")))).toBe("webp");
  });

  it("menolak file lain walau mengaku gambar", () => {
    expect(detectImageKind(bytes(...ascii("<svg")))).toBeNull();
    expect(detectImageKind(bytes(0x89, 0x50, 0x4e, 0x47))).toBeNull(); // PNG: client selalu mengirim JPEG
    expect(detectImageKind(bytes(...ascii("%PDF-1.7")))).toBeNull();
  });
});
