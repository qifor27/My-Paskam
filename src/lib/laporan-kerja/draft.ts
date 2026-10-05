import { STORES, draftStore } from "@/lib/draft-store";

export type LaporanFields = {
  tanggal: string;
  unitId: string;
  operatorName: string;
  hmJam: string;
  bbm: string;
  lokasi: string;
  deskripsi: string;
};

export type DraftPhoto = {
  id: string;
  width: number;
  height: number;
  uploaded: boolean;
  /** Ada selama foto belum terunggah. */
  blob?: Blob;
};

export type LaporanDraft = {
  id: string;
  mode: "create" | "edit";
  updatedAt: number;
  fields: LaporanFields;
  photos: DraftPhoto[];
};

export const laporanDrafts = {
  get: (id: string) => draftStore.get<LaporanDraft>(STORES.laporan, id),
  list: () => draftStore.list<LaporanDraft>(STORES.laporan),
  save: (draft: LaporanDraft) => draftStore.put(STORES.laporan, draft),
  remove: (id: string) => draftStore.delete(STORES.laporan, id),
};
