import { Hammer } from "lucide-react";

import { AccessDenied } from "@/components/access-denied";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { NAV_ITEMS } from "@/lib/navigation";

/**
 * Halaman modul yang belum dibangun. Struktur navigasi sudah final sehingga
 * user (dan permission) bisa diuji sejak sekarang. Diganti saat sprint modul.
 */
export async function ModulePlaceholder({ href, creating = false }: { href: string; creating?: boolean }) {
  const user = await requireUser();
  const item = NAV_ITEMS.find((i) => i.href === href);
  if (!item) throw new Error(`Nav item tidak dikenal: ${href}`);
  if (item.permission && !can(user.role, item.permission)) return <AccessDenied />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={creating && item.create ? `Buat ${item.create.label}` : item.label} backHref={creating ? item.href : undefined} />
      <EmptyState
        icon={Hammer}
        title="Modul sedang disiapkan"
        description={`${item.description}. Modul ini akan tersedia pada rilis berikutnya.`}
      />
    </div>
  );
}
