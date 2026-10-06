import type { TileColor } from "@/lib/navigation";

// Jenis unit dari namanya (master data bebas diisi Owner). Satu tempat untuk
// mengubah pemetaan bila ada jenis unit baru. Asumsi: PASKAM = excavator.
export type UnitKind = "excavator" | "dump" | "towing" | "other";

export function unitKind(name: string): UnitKind {
  const n = name.toUpperCase();
  if (n.includes("DUMP")) return "dump";
  if (n.includes("TOW") || n.includes("DEREK")) return "towing";
  if (n.startsWith("PASKAM") || n.includes("EXCAVATOR") || n.includes("EXCA")) return "excavator";
  return "other";
}

export const UNIT_TILE: Record<UnitKind, TileColor> = {
  excavator: "blue",
  dump: "orange",
  towing: "violet",
  other: "cyan",
};
