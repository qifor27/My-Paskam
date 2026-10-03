import type { Metadata } from "next";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";

import { PengawasCreateForm } from "./create-form";

export const metadata: Metadata = { title: "Tambah Pengawas" };

export default async function NewPengawasPage() {
  const user = await requireUser();
  if (!can(user.role, "pengawas:manage")) return <AccessDenied />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Tambah Pengawas" backHref="/pengawas" />
      <PengawasCreateForm pinLength={AUTH_CONFIG.pinLength} />
    </div>
  );
}
