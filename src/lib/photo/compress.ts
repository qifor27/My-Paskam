import { PHOTO_RULES } from "./rules";

export type CompressedPhoto = { blob: Blob; width: number; height: number };

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    // imageOrientation: foto HP yang diputar (EXIF) tampil tegak.
    return createImageBitmap(file, { imageOrientation: "from-image" });
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Kompres di HP sebelum upload (PRD §39.3): sisi terpanjang ±1600 px, JPEG 80%.
 * Re-encode lewat canvas juga membuang metadata EXIF (termasuk lokasi GPS).
 */
export async function compressImage(file: File): Promise<CompressedPhoto> {
  try {
    const source = await decode(file);
    const scale = Math.min(1, PHOTO_RULES.maxDimension / Math.max(source.width, source.height));
    const width = Math.round(source.width * scale);
    const height = Math.round(source.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d tidak tersedia");
    ctx.drawImage(source, 0, 0, width, height);
    if ("close" in source) source.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", PHOTO_RULES.quality));
    if (!blob) throw new Error("toBlob gagal");
    return { blob, width, height };
  } catch (error) {
    // PRD §39.3: kompresi gagal tidak boleh menghilangkan laporan. Pakai file asli
    // jika sudah JPEG kecil; selain itu biarkan pemanggil menandai foto gagal.
    if (file.type === "image/jpeg" && file.size <= PHOTO_RULES.maxBytes) {
      return { blob: file, width: 1, height: 1 };
    }
    throw error;
  }
}
