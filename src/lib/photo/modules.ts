import "server-only";

import type { PhotoModule } from "@/generated/prisma/enums";
import type { Permission } from "@/lib/auth/permissions";
import type { CurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { canViewOwned, type OwnedRecord } from "@/lib/records/access";

type ModuleConfig = {
  /** Folder di storage (PRD §39.2). */
  dir: string;
  /** Izin untuk mengunggah foto ke modul ini. */
  createPermission: Permission;
  viewAllPermission: Permission;
  findRecord: (id: string) => Promise<(OwnedRecord & { id: string }) | null>;
};

// Registry modul yang memakai foto. Planning Job ditambahkan saat modulnya dibuat.
export const PHOTO_MODULES: Partial<Record<PhotoModule, ModuleConfig>> = {
  LAPORAN_KERJA: {
    dir: "laporan-kerja",
    createPermission: "laporan-kerja:create",
    viewAllPermission: "laporan-kerja:view-all",
    findRecord: (id) => db.laporanKerja.findUnique({ where: { id } }),
  },
  ORDER_SPARE_PART: {
    dir: "order-spare-part",
    createPermission: "spare-part:create",
    viewAllPermission: "spare-part:view-all",
    findRecord: (id) => db.orderSparePart.findUnique({ where: { id } }),
  },
};

export function photoModule(module: PhotoModule): ModuleConfig {
  const config = PHOTO_MODULES[module];
  if (!config) throw new Error(`Modul foto tidak didukung: ${module}`);
  return config;
}

export function canViewRecord(user: CurrentUser, module: PhotoModule, record: OwnedRecord) {
  return canViewOwned(user, record, photoModule(module).viewAllPermission);
}
