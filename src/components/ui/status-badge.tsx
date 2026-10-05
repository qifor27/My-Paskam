import { Circle, CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Pill status = ikon + teks + warna, tidak pernah warna saja (Carbon).
// Maksimal 5 nada. Oranye tidak dipakai untuk status karena khusus aksen aksi.
// Label: satu kata, sentence case, bentuk lampau untuk status selesai.
const TONES = {
  neutral: { cls: "bg-neutral-50 text-neutral-700", icon: Circle },
  info: { cls: "bg-brand-50 text-brand-800", icon: Info },
  success: { cls: "bg-success-50 text-success-800", icon: CircleCheck },
  warning: { cls: "bg-warning-50 text-warning-900", icon: TriangleAlert },
  danger: { cls: "bg-danger-50 text-danger-800", icon: CircleAlert },
} satisfies Record<string, { cls: string; icon: LucideIcon }>;

export type StatusTone = keyof typeof TONES;

export function StatusBadge({
  tone,
  children,
  icon,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  /** Ganti ikon default tone, mis. Clock untuk "Menunggu". */
  icon?: LucideIcon;
  className?: string;
}) {
  const { cls, icon: DefaultIcon } = TONES[tone];
  const Icon = icon ?? DefaultIcon;
  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-[200px] shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold",
        cls,
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{children}</span>
    </span>
  );
}
