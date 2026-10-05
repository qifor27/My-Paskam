import type { Metadata } from "next";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { selectableUnits } from "@/lib/laporan-kerja/queries";
import { sparePartSuggestions } from "@/lib/spare-part/queries";

import { SparePartForm } from "../spare-part-form";

export const metadata: Metadata = { title: "Catat Spare Part" };

export default async function NewSparePartPage({ searchParams }: { searchParams: Promise<{ draft?: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "spare-part:create")) return <AccessDenied />;
  const { draft } = await searchParams;
  const [units, suggestions] = await Promise.all([selectableUnits(), sparePartSuggestions(user.id)]);
  const draftId = draft && /^[0-9a-f-]{36}$/i.test(draft) ? draft : undefined;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Catat spare part rusak" description={`Pengawas: ${user.name}`} backHref="/spare-part" />
      <SparePartForm mode="create" id={draftId} units={units} suggestions={suggestions} />
    </div>
  );
}
