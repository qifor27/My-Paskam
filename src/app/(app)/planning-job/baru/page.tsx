import type { Metadata } from "next";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { Alert } from "@/components/ui/alert";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { todayISO } from "@/lib/format";
import { selectableUnits } from "@/lib/laporan-kerja/queries";
import { activePengawas } from "@/lib/planning/queries";

import { PlanningForm } from "../planning-form";

export const metadata: Metadata = { title: "Buat Planning Job" };

export default async function NewPlanningPage() {
  const user = await requireUser();
  if (!can(user.role, "planning-job:create")) return <AccessDenied />;
  const [pengawas, units] = await Promise.all([activePengawas(), selectableUnits()]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Buat planning job" backHref="/planning-job" />
      {pengawas.length === 0 ? (
        <Alert tone="warning">Belum ada Pengawas aktif. Tambahkan akun Pengawas terlebih dahulu di menu Pengawas.</Alert>
      ) : (
        <PlanningForm mode="create" today={todayISO()} pengawas={pengawas} units={units} />
      )}
    </div>
  );
}
