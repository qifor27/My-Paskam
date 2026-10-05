import type { Metadata } from "next";

import { AccessDenied } from "@/components/access-denied";
import { PageHeader } from "@/components/page-header";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { can } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/auth/session";
import { dataPinState } from "@/lib/laporan-data/pin";

import { SetPinForm } from "../pin-gate";

export const metadata: Metadata = { title: "PIN Laporan Data" };

export default async function DataPinPage() {
  const user = await requireUser();
  if (!can(user.role, "laporan-data:access")) return <AccessDenied />;
  const { state } = await dataPinState(user);
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="PIN Laporan Data" backHref="/akun" />
      <SetPinForm pinLength={AUTH_CONFIG.pinLength} mode={state === "unset" ? "create" : "change"} />
    </div>
  );
}
