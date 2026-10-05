"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { compressImage } from "@/lib/photo/compress";
import { PHOTO_RULES } from "@/lib/photo/rules";
import { createClientId } from "@/lib/sync/client-id";

export type PhotoStatus = "processing" | "uploading" | "uploaded" | "failed";

export type PhotoItem = {
  id: string;
  width: number;
  height: number;
  status: PhotoStatus;
  progress: number;
  previewUrl: string;
  blob?: Blob;
  error?: string;
};

const NETWORK_MESSAGE = "Foto belum terunggah karena koneksi terputus. Foto tetap tersimpan di HP.";

function sendPhoto(item: PhotoItem, recordId: string, onProgress: (p: number) => void) {
  return new Promise<{ ok: true } | { ok: false; message: string }>((resolve) => {
    if (!item.blob) return resolve({ ok: false, message: "File foto tidak tersedia. Hapus lalu ambil ulang." });
    const body = new FormData();
    body.append("id", item.id);
    body.append("recordId", recordId);
    body.append("width", String(item.width));
    body.append("height", String(item.height));
    body.append("file", item.blob, `${item.id}.jpg`);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/foto");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) return resolve({ ok: true });
      let message = "Foto gagal diunggah. Coba lagi.";
      try {
        message = JSON.parse(xhr.responseText).error?.message ?? message;
      } catch {}
      if (xhr.status === 401) message = "Sesi Anda telah berakhir. Login kembali; foto tetap tersimpan di HP.";
      resolve({ ok: false, message });
    };
    xhr.onerror = () => resolve({ ok: false, message: NETWORK_MESSAGE });
    xhr.ontimeout = () => resolve({ ok: false, message: NETWORK_MESSAGE });
    xhr.timeout = 60_000;
    xhr.send(body);
  });
}

/**
 * Kelola foto satu laporan: kompres → unggah per foto (progress) → coba lagi.
 * Foto langsung diunggah begitu dipilih agar saat "Simpan" tinggal mengirim teks.
 */
export function usePhotoUploads(recordId: string, initial: PhotoItem[]) {
  const [items, setItems] = useState<PhotoItem[]>(initial);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const update = useCallback((id: string, patch: Partial<PhotoItem>) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }, []);

  const upload = useCallback(
    async (item: PhotoItem) => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        update(item.id, { status: "failed", error: NETWORK_MESSAGE });
        return;
      }
      update(item.id, { status: "uploading", progress: 0, error: undefined });
      const result = await sendPhoto(item, recordId, (progress) => update(item.id, { progress }));
      if (result.ok) update(item.id, { status: "uploaded", progress: 100, blob: undefined });
      else update(item.id, { status: "failed", error: result.message });
    },
    [recordId, update],
  );

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const room = PHOTO_RULES.maxPerRecord - itemsRef.current.length;
      for (const file of Array.from(files).slice(0, Math.max(0, room))) {
        const id = createClientId();
        const previewUrl = URL.createObjectURL(file);
        setItems((prev) => [...prev, { id, width: 1, height: 1, status: "processing", progress: 0, previewUrl }]);
        try {
          const { blob, width, height } = await compressImage(file);
          const item: PhotoItem = { id, width, height, status: "uploading", progress: 0, previewUrl, blob };
          update(id, item);
          await upload(item);
        } catch {
          update(id, { status: "failed", error: "Foto tidak bisa diproses. Hapus lalu coba foto lain." });
        }
      }
    },
    [update, upload],
  );

  const retry = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((p) => p.id === id);
      if (item?.blob) void upload(item);
    },
    [upload],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  // Foto dari draft yang belum terunggah: unggah otomatis saat dibuka, dan coba
  // ulang semua yang gagal ketika koneksi kembali.
  useEffect(() => {
    const retryPending = () =>
      itemsRef.current.filter((p) => p.blob && (p.status === "failed" || p.status === "uploading")).forEach((p) => void upload(p));
    retryPending();
    window.addEventListener("online", retryPending);
    return () => window.removeEventListener("online", retryPending);
  }, [upload]);

  return {
    items,
    addFiles,
    retry,
    remove,
    busy: items.some((p) => p.status === "processing" || p.status === "uploading"),
    failedCount: items.filter((p) => p.status === "failed").length,
  };
}
