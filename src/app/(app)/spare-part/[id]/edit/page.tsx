import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { selectableUnits } from "@/lib/laporan-kerja/queries";
import { recordPhotos } from "@/lib/photo/service";
import { canEditSparePart, canViewSparePart } from "@/lib/spare-part/access";
import { sparePartSuggestions } from "@/lib/spare-part/queries";

import { SparePartForm } from "../../spare-part-form";

export const metadata: Metadata = { title: "Ubah Catatan Spare Part" };

export default async function EditSparePartPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const record = await db.orderSparePart.findUnique({ where: { id } });
  if (!record || !canViewSparePart(user, record)) notFound();
  if (!canEditSparePart(user, record)) return <AccessDenied />;

  const [units, suggestions, photos] = await Promise.all([
    selectableUnits(record.unitId),
    sparePartSuggestions(user.id),
    recordPhotos("ORDER_SPARE_PART", record),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Ubah catatan spare part" backHref={`/spare-part/${id}`} />
      <SparePartForm
        mode="edit"
        id={id}
        units={units}
        suggestions={suggestions}
        initialPhotos={photos}
        initialFields={{ unitId: record.unitId, partName: record.partName, kerusakan: record.kerusakan, lokasi: record.lokasi }}
      />
    </div>
  );
}
