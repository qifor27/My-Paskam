import type { Role } from "@/generated/prisma/enums";
import { can, type Permission } from "@/lib/auth/permissions";

// Satu sumber untuk navigasi, dashboard, menu "Buat baru", dan halaman modul.
// Icon mengikuti PRD §5 (components/nav-icon.tsx); warna tile per modul ADR-013.
export type NavIconName =
  | "home"
  | "laporan-kerja"
  | "spare-part"
  | "planning-job"
  | "laporan-data"
  | "pengawas"
  | "unit"
  | "akun";

export type TileColor = "blue" | "orange" | "violet" | "green" | "cyan";

export type NavItem = {
  href: string;
  label: string;
  /** Label pendek untuk bottom navigation / aksi cepat. */
  shortLabel: string;
  description: string;
  icon: NavIconName;
  tile: TileColor;
  permission?: Permission;
  /** Role yang menampilkan item ini di bottom navigation (maks. 4 + tombol "+"). */
  bottomNav: readonly Role[];
  /** Tampil di grid aksi cepat Beranda. */
  quickAction: boolean;
  group: "main" | "admin" | "account";
  /** Entri menu "Buat baru" (tombol + oranye). Izin default = izin item. */
  create?: { href: string; label: string; permission?: Permission };
};

const BOTH = ["SUPER_ADMIN", "PENGAWAS"] as const;

export const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "Beranda",
    shortLabel: "Beranda",
    description: "",
    icon: "home",
    tile: "blue",
    bottomNav: BOTH,
    quickAction: false,
    group: "main",
  },
  {
    href: "/laporan-kerja",
    label: "Laporan Kerja",
    shortLabel: "Laporan",
    description: "Catat pekerjaan unit, HM, BBM, dan foto",
    icon: "laporan-kerja",
    tile: "blue",
    permission: "laporan-kerja:access",
    bottomNav: BOTH,
    quickAction: true,
    group: "main",
    create: { href: "/laporan-kerja/baru", label: "Laporan Kerja", permission: "laporan-kerja:create" },
  },
  {
    href: "/spare-part",
    label: "Order Spare Part",
    shortLabel: "Spare Part",
    description: "Ajukan kebutuhan spare part dan kerusakan",
    icon: "spare-part",
    tile: "orange",
    permission: "spare-part:access",
    bottomNav: ["PENGAWAS"],
    quickAction: true,
    group: "main",
    create: { href: "/spare-part/baru", label: "Order Spare Part" },
  },
  {
    href: "/planning-job",
    label: "Planning Job",
    shortLabel: "Planning",
    description: "Rencana pekerjaan dan jadwal mulai",
    icon: "planning-job",
    tile: "violet",
    permission: "planning-job:access",
    bottomNav: [],
    quickAction: true,
    group: "main",
    create: { href: "/planning-job/baru", label: "Planning Job" },
  },
  {
    href: "/laporan-data",
    label: "Laporan Data",
    shortLabel: "Data",
    description: "Filter data operasional dan export PDF",
    icon: "laporan-data",
    tile: "green",
    permission: "laporan-data:access",
    bottomNav: ["SUPER_ADMIN"],
    quickAction: true,
    group: "main",
  },
  {
    href: "/pengawas",
    label: "Pengawas",
    shortLabel: "Pengawas",
    description: "Kelola akun, reset PIN, aktif/nonaktif",
    icon: "pengawas",
    tile: "cyan",
    permission: "pengawas:manage",
    bottomNav: [],
    quickAction: false,
    group: "admin",
    create: { href: "/pengawas/baru", label: "Akun Pengawas" },
  },
  {
    href: "/unit",
    label: "Unit",
    shortLabel: "Unit",
    description: "Tambah unit, ubah nama, aktif/nonaktif",
    icon: "unit",
    tile: "blue",
    permission: "unit:manage",
    bottomNav: [],
    quickAction: false,
    group: "admin",
  },
  {
    href: "/akun",
    label: "Akun",
    shortLabel: "Akun",
    description: "Profil dan keluar",
    icon: "akun",
    tile: "blue",
    bottomNav: BOTH,
    quickAction: false,
    group: "account",
  },
];

export function navFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.permission || can(role, item.permission));
}

export function bottomNavFor(role: Role): NavItem[] {
  return navFor(role).filter((item) => item.bottomNav.includes(role));
}

export function createActionsFor(role: Role) {
  return navFor(role).flatMap((item) =>
    item.create && (!item.create.permission || can(role, item.create.permission))
      ? [{ href: item.create.href, label: item.create.label, icon: item.icon, tile: item.tile }]
      : [],
  );
}

/** Item yang aktif untuk sebuah path: "/" hanya cocok persis, lainnya per segmen. */
export function isActive(item: Pick<NavItem, "href">, pathname: string): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
