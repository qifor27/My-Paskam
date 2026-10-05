// Antrean kirim (outbox) data lapangan (PRD §19, §24, ADR-019). Berjalan di
// browser: saat aplikasi dibuka, saat kembali online, berkala, atau manual.
// Aman diulang: id record & foto dibuat di client sehingga server tidak menduplikasi.
import { saveLaporan } from "@/app/(app)/laporan-kerja/actions";
import { saveSparePart } from "@/app/(app)/spare-part/actions";
import { laporanDrafts } from "@/lib/laporan-kerja/draft";
import { uploadPhoto, type PhotoModuleName } from "@/lib/photo/upload-client";
import { sparePartDrafts } from "@/lib/spare-part/draft";

import { notifyDraftsChanged, type BaseDraft } from "./draft-types";

type AnyDraft = BaseDraft<Record<string, string>>;
type SaveResult = { ok: true; data: unknown } | { ok: false; error: { category: string; message: string } };

type OutboxModule = {
  key: "laporan-kerja" | "spare-part";
  photoModule: PhotoModuleName;
  list: () => Promise<AnyDraft[]>;
  save: (d: AnyDraft) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  send: (form: FormData) => Promise<SaveResult>;
};

export const OUTBOX_MODULES: OutboxModule[] = [
  {
    key: "laporan-kerja",
    photoModule: "LAPORAN_KERJA",
    list: () => laporanDrafts.list() as unknown as Promise<AnyDraft[]>,
    save: (d) => laporanDrafts.save(d as never),
    remove: laporanDrafts.remove,
    send: saveLaporan as (f: FormData) => Promise<SaveResult>,
  },
  {
    key: "spare-part",
    photoModule: "ORDER_SPARE_PART",
    list: () => sparePartDrafts.list() as unknown as Promise<AnyDraft[]>,
    save: (d) => sparePartDrafts.save(d as never),
    remove: sparePartDrafts.remove,
    send: saveSparePart as (f: FormData) => Promise<SaveResult>,
  },
];

export type OutboxCounts = { queued: number; failed: number };

export async function countOutbox(userId: string): Promise<OutboxCounts> {
  let queued = 0;
  let failed = 0;
  for (const m of OUTBOX_MODULES) {
    for (const d of await m.list().catch(() => [])) {
      if (d.userId !== userId) continue;
      if (d.sync?.status === "queued") queued++;
      if (d.sync?.status === "failed") failed++;
    }
  }
  return { queued, failed };
}

type SendOutcome = "sent" | "pending" | "failed" | "session";

async function sendDraft(m: OutboxModule, draft: AnyDraft): Promise<SendOutcome> {
  // 1. Foto yang belum terunggah.
  for (const photo of draft.photos) {
    if (photo.uploaded || !photo.blob) continue;
    const r = await uploadPhoto({ id: photo.id, width: photo.width, height: photo.height, blob: photo.blob }, m.photoModule, draft.id);
    if (r.ok) {
      photo.uploaded = true;
      delete photo.blob;
      await m.save(draft);
      continue;
    }
    if (r.kind === "session") return "session";
    if (r.kind === "network") return "pending";
    await m.save({ ...draft, sync: { status: "failed", queuedAt: draft.sync?.queuedAt ?? Date.now(), error: r.message } });
    return "failed";
  }

  // 2. Data teks + daftar foto.
  const form = new FormData();
  form.set("id", draft.id);
  for (const [k, v] of Object.entries(draft.fields)) form.set(k, v);
  form.set("photoIds", draft.photos.map((p) => p.id).join(","));
  let result: SaveResult;
  try {
    result = await m.send(form);
  } catch {
    return "pending";
  }
  if (result.ok) {
    await m.remove(draft.id);
    return "sent";
  }
  if (result.error.category === "NETWORK" || result.error.category === "SERVER" || result.error.category === "UNEXPECTED") return "pending";
  if (result.error.category === "SESSION_EXPIRED") return "session";
  // Validasi/izin: perlu diperbaiki user; tandai gagal dengan pesan dari server.
  await m.save({ ...draft, sync: { status: "failed", queuedAt: draft.sync?.queuedAt ?? Date.now(), error: result.error.message || "Periksa kembali isian." } });
  return "failed";
}

let running: Promise<{ sent: number; sessionExpired: boolean }> | null = null;

/** Kirim semua draft antre milik user. Satu proses pada satu waktu. */
export function processOutbox(userId: string) {
  running ??= (async () => {
    let sent = 0;
    let sessionExpired = false;
    try {
      for (const m of OUTBOX_MODULES) {
        const queued = (await m.list().catch(() => [])).filter((d) => d.userId === userId && d.sync?.status === "queued");
        for (const draft of queued.sort((a, b) => (a.sync?.queuedAt ?? 0) - (b.sync?.queuedAt ?? 0))) {
          if (!navigator.onLine) return { sent, sessionExpired };
          const outcome = await sendDraft(m, draft);
          if (outcome === "sent") sent++;
          if (outcome === "session") return { sent, sessionExpired: (sessionExpired = true) };
          if (outcome === "pending") return { sent, sessionExpired };
        }
      }
      return { sent, sessionExpired };
    } finally {
      running = null;
      notifyDraftsChanged();
    }
  })();
  return running;
}
