import { STORES, draftStore } from "@/lib/draft-store";
import type { DraftPhoto } from "@/lib/laporan-kerja/draft";

export type SparePartFields = { unitId: string; partName: string; kerusakan: string; lokasi: string };

export type SparePartDraft = {
  id: string;
  mode: "create" | "edit";
  updatedAt: number;
  fields: SparePartFields;
  photos: DraftPhoto[];
};

export const sparePartDrafts = {
  get: (id: string) => draftStore.get<SparePartDraft>(STORES.sparePart, id),
  list: () => draftStore.list<SparePartDraft>(STORES.sparePart),
  save: (draft: SparePartDraft) => draftStore.put(STORES.sparePart, draft),
  remove: (id: string) => draftStore.delete(STORES.sparePart, id),
};
