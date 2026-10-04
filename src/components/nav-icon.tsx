import { CalendarDays, ClipboardList, FileChartColumn, House, Package, Users, type LucideProps } from "lucide-react";

import type { NavItem } from "@/lib/navigation";

// Pemetaan icon PRD §5. Satu tempat agar icon modul konsisten di semua layar.
const ICONS = {
  home: House,
  "laporan-kerja": ClipboardList,
  "spare-part": Package,
  "planning-job": CalendarDays,
  "laporan-data": FileChartColumn,
  pengawas: Users,
} satisfies Record<NavItem["icon"], React.ComponentType<LucideProps>>;

export function NavIcon({ name, ...props }: { name: NavItem["icon"] } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}
