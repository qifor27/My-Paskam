import {
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  FileChartColumn,
  House,
  Package,
  Truck,
  Users,
  type LucideProps,
} from "lucide-react";

import type { NavIconName, TileColor } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// Pemetaan icon PRD §5. Satu tempat agar icon modul konsisten di semua layar.
const ICONS = {
  home: House,
  "laporan-kerja": ClipboardList,
  "spare-part": Package,
  "planning-job": CalendarDays,
  "laporan-data": FileChartColumn,
  pengawas: Users,
  unit: Truck,
  akun: CircleUserRound,
} satisfies Record<NavIconName, React.ComponentType<LucideProps>>;

export function NavIcon({ name, ...props }: { name: NavIconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}

const TILE = {
  blue: "bg-tile-blue-bg text-tile-blue-fg",
  orange: "bg-tile-orange-bg text-tile-orange-fg",
  violet: "bg-tile-violet-bg text-tile-violet-fg",
  green: "bg-tile-green-bg text-tile-green-fg",
  cyan: "bg-tile-cyan-bg text-tile-cyan-fg",
} satisfies Record<TileColor, string>;

/** Tile ikon pastel per modul (ADR-013). */
export function ModuleTile({
  icon,
  color,
  size = "md",
  className,
}: {
  icon: NavIconName;
  color: TileColor;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-control)]",
        size === "lg" ? "size-14" : "size-11",
        TILE[color],
        className,
      )}
    >
      <NavIcon name={icon} className={size === "lg" ? "size-6" : "size-5"} />
    </span>
  );
}
