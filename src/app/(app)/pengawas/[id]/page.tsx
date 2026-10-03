import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";

import { EditForm, PinResetForm, StatusForm } from "./forms";

export const metadata: Metadata = { title: "Detail Pengawas" };

export default async function PengawasDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!can(user.role, "pengawas:manage")) return <AccessDenied />;

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const pengawas = await db.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true, kodePengawas: true, isActive: true },
  });
  if (!pengawas || pengawas.role !== "PENGAWAS") notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={pengawas.name} backHref="/pengawas" />

      <Section title="Data Pengawas">
        <EditForm id={pengawas.id} name={pengawas.name} kodePengawas={pengawas.kodePengawas ?? ""} />
      </Section>

      <Section title="Reset PIN" description="Pengawas akan keluar dari semua perangkat dan harus masuk dengan PIN baru.">
        <PinResetForm id={pengawas.id} pinLength={AUTH_CONFIG.pinLength} />
      </Section>

      <Section title="Status akun">
        <StatusForm id={pengawas.id} isActive={pengawas.isActive} />
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-border pt-5 first-of-type:border-t-0 first-of-type:pt-0">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
