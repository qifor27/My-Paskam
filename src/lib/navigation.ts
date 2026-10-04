import type { Role } from "@/generated/prisma/enums";
import { can, type Permission } from "@/lib/auth/permissions";

// Satu sumber untuk navigasi, dashboard, dan halaman modul. Icon mengikuti
// pemetaan PRD §5 (lihat components/nav-icon.tsx).
export type NavItem = {
  href: string;
  label: string;
  /** Label pendek untuk bottom navigation mobile. */
  shortLabel: string;
  description: string;
  icon: "home" | "laporan-kerja" | "spare-part" | "planning-job" | "laporan-data" | "pengawas";
  permission?: Permission;
  /** Tampil di bottom navigation (maks. 5 item). */
  bottomNav: boolean;
  group: "main" | "admin";
};

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Beranda",
    shortLabel: "Beranda",
    description: "",
    icon: "home",
    bottomNav: true,
    group: "main",
  },
  {
    href: "/laporan-kerja",
    label: "Laporan Kerja",
    shortLabel: "Laporan",
    description: "Catat pekerjaan unit, HM, BBM, dan foto",
    icon: "laporan-kerja",
    permission: "laporan-kerja:access",
    bottomNav: true,
    group: "main",
  },
  {
    href: "/spare-part",
    label: "Order Spare Part",
    shortLabel: "Spare Part",
    description: "Ajukan kebutuhan spare part dan kerusakan",
    icon: "spare-part",
    permission: "spare-part:access",
    bottomNav: true,
    group: "main",
  },
  {
    href: "/planning-job",
    label: "Planning Job",
    shortLabel: "Planning",
    description: "Rencana pekerjaan dan jadwal mulai",
    icon: "planning-job",
    permission: "planning-job:access",
    bottomNav: true,
    group: "main",
  },
  {
    href: "/laporan-data",
    label: "Laporan Data",
    shortLabel: "Data",
    description: "Filter data operasional dan export PDF",
    icon: "laporan-data",
    permission: "laporan-data:access",
    bottomNav: true,
    group: "main",
  },
  {
    href: "/pengawas",
    label: "Pengawas",
    shortLabel: "Pengawas",
    description: "Kelola akun, reset PIN, aktif/nonaktif",
    icon: "pengawas",
    permission: "pengawas:manage",
    bottomNav: false,
    group: "admin",
  },
];

export function navFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.permission || can(role, item.permission));
}

/** Item yang aktif untuk sebuah path: "/" hanya cocok persis, lainnya per segmen. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
