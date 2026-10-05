"use client";

import { Camera, CircleAlert, CircleCheck, ImagePlus, LoaderCircle, RotateCw, X } from "lucide-react";
import { useRef } from "react";

import type { PhotoItem } from "@/hooks/use-photo-uploads";
import { PHOTO_RULES } from "@/lib/photo/rules";
import { cn } from "@/lib/utils";

/**
 * Foto laporan (PRD §18): tombol Kamera & Galeri terpisah (di Android,
 * capture="environment" menyembunyikan galeri), preview, progress, coba lagi.
 */
export function PhotoGrid({
  items,
  onAdd,
  onRetry,
  onRemove,
  invalid,
  describedBy,
}: {
  items: PhotoItem[];
  onAdd: (files: FileList) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const full = items.length >= PHOTO_RULES.maxPerRecord;

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) onAdd(e.target.files);
    e.target.value = ""; // agar file yang sama bisa dipilih lagi
  };

  return (
    <div className="flex flex-col gap-3" aria-describedby={describedBy}>
      {items.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2">
          {items.map((p) => (
            <li key={p.id} className="relative aspect-square overflow-hidden rounded-[var(--radius-control)] border border-border bg-canvas">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL & foto privat */}
              <img src={p.previewUrl} alt="" className="size-full object-cover" />

              {p.status === "processing" || p.status === "uploading" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/45 text-white">
                  <LoaderCircle className="size-6 animate-spin motion-reduce:animate-none" aria-hidden />
                  <span className="text-xs font-semibold tabular-nums">
                    {p.status === "processing" ? "Memproses…" : `${p.progress}%`}
                  </span>
                  <span className="sr-only">Mengunggah foto</span>
                </div>
              ) : null}

              {p.status === "failed" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-danger-800/80 p-1 text-center text-white">
                  <CircleAlert className="size-5" aria-hidden />
                  <span className="text-xs font-semibold">Gagal</span>
                  {p.blob ? (
                    <button
                      type="button"
                      onClick={() => onRetry(p.id)}
                      className="flex h-8 items-center gap-1 rounded-full bg-white px-3 text-xs font-semibold text-danger-800"
                    >
                      <RotateCw className="size-3.5" aria-hidden /> Coba lagi
                    </button>
                  ) : null}
                </div>
              ) : null}

              {p.status === "uploaded" ? (
                <span className="absolute bottom-1.5 left-1.5 flex size-6 items-center justify-center rounded-full bg-success-600 text-white">
                  <CircleCheck className="size-4" aria-hidden />
                  <span className="sr-only">Terunggah</span>
                </span>
              ) : null}

              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label="Hapus foto"
                className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-full bg-ink/60 text-white hover:bg-ink/80"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {items.some((p) => p.status === "failed") ? (
        <p className="text-sm font-medium text-danger-800" role="alert">
          {items.find((p) => p.status === "failed")?.error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={full}
          onClick={() => cameraRef.current?.click()}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full border bg-surface text-[15px] font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50",
            invalid ? "border-danger-600" : "border-border-strong",
          )}
        >
          <Camera className="size-5" aria-hidden /> Kamera
        </button>
        <button
          type="button"
          disabled={full}
          onClick={() => galleryRef.current?.click()}
          className={cn(
            "flex h-12 items-center justify-center gap-2 rounded-full border bg-surface text-[15px] font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50",
            invalid ? "border-danger-600" : "border-border-strong",
          )}
        >
          <ImagePlus className="size-5" aria-hidden /> Galeri
        </button>
      </div>
      <p className="text-sm tabular-nums text-ink-muted">
        {items.length}/{PHOTO_RULES.maxPerRecord} foto · minimal {PHOTO_RULES.minPerRecord}
      </p>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle} />
      <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handle} />
    </div>
  );
}
