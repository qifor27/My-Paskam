import type { Metadata } from "next";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { AddUnitForm, UnitRow } from "./unit-forms";

export const metadata: Metadata = { title: "Unit" };

export default async function UnitPage() {
  const user = await requireUser();
  if (!can(user.role, "unit:manage")) return <AccessDenied />;
  const units = await db.unit.findMany({ orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }] });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Unit" description="Daftar unit yang bisa dipilih di Laporan Kerja" backHref="/akun" />
      <AddUnitForm />
      <ul className="flex flex-col gap-2">
        {units.map((u) => (
          <li key={u.id}>
            <UnitRow id={u.id} name={u.name} isActive={u.isActive} />
          </li>
        ))}
      </ul>
    </div>
  );
}
