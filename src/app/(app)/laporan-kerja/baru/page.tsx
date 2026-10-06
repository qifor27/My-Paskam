import type { Metadata } from "next";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { todayISO } from "@/lib/format";
import { fieldSuggestions, selectableUnits } from "@/lib/laporan-kerja/queries";

import { LaporanForm } from "../laporan-form";

export const metadata: Metadata = { title: "Buat Laporan Kerja" };

export default async function NewLaporanPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "laporan-kerja:create")) return <AccessDenied />;
  const { draft } = await searchParams;
  const [units, suggestions] = await Promise.all([selectableUnits(), fieldSuggestions(user.id)]);
  const draftId = draft && /^[0-9a-f-]{36}$/i.test(draft) ? draft : undefined;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Buat laporan kerja" description={`Dicatat oleh: ${user.name}${user.role === "SUPER_ADMIN" ? " (Owner)" : ""}`} backHref="/laporan-kerja" />
      <LaporanForm userId={user.id} mode="create" id={draftId} today={todayISO()} units={units} suggestions={suggestions} />
    </div>
  );
}
