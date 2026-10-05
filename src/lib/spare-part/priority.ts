import { SignalHigh, SignalLow, SignalMedium, type LucideIcon } from "lucide-react";

import type { StatusTone } from "@/components/ui/status-badge";

// Prioritas spare part (ADR-017). Ikon bar sinyal: makin tinggi makin penuh,
// terbaca tanpa warna (pola Linear), bukan ikon dekoratif.
export const PRIORITIES = ["RENDAH", "SEDANG", "TINGGI"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<Priority, { label: string; tone: StatusTone; icon: LucideIcon }> = {
  RENDAH: { label: "Rendah", tone: "neutral", icon: SignalLow },
  SEDANG: { label: "Sedang", tone: "info", icon: SignalMedium },
  TINGGI: { label: "Tinggi", tone: "danger", icon: SignalHigh },
};
