import { STORES, draftStore } from "@/lib/draft-store";
import type { BaseDraft } from "@/lib/sync/draft-types";

export type { DraftPhoto } from "@/lib/sync/draft-types";

export type LaporanFields = {
  tanggal: string;
  unitId: string;
  operatorName: string;
  hmJam: string;
  bbm: string;
  lokasi: string;
  deskripsi: string;
};

export type LaporanDraft = BaseDraft<LaporanFields>;

export const laporanDrafts = {
  get: (id: string) => draftStore.get<LaporanDraft>(STORES.laporan, id),
  list: () => draftStore.list<LaporanDraft>(STORES.laporan),
  save: (draft: LaporanDraft) => draftStore.put(STORES.laporan, draft),
  remove: (id: string) => draftStore.delete(STORES.laporan, id),
};
