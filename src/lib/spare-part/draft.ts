import { STORES, draftStore } from "@/lib/draft-store";
import type { BaseDraft } from "@/lib/sync/draft-types";

export type SparePartFields = {
  unitId: string;
  partName: string;
  partNumber: string;
  quantity: string;
  priority: string;
  kerusakan: string;
  lokasi: string;
};

export type SparePartDraft = BaseDraft<SparePartFields>;

export const sparePartDrafts = {
  get: (id: string) => draftStore.get<SparePartDraft>(STORES.sparePart, id),
  list: () => draftStore.list<SparePartDraft>(STORES.sparePart),
  save: (draft: SparePartDraft) => draftStore.put(STORES.sparePart, draft),
  remove: (id: string) => draftStore.delete(STORES.sparePart, id),
};
