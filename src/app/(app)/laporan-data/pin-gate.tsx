"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { ErrorAlert } from "@/components/error-alert";
import { PinFields } from "@/components/pin-fields";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";

import { setDataPin, unlockData } from "./actions";

function GateCard({ icon: Icon, title, description, children }: { icon: typeof LockKeyhole; title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="mx-auto flex w-full max-w-sm flex-col gap-5 p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-tile-green-bg text-tile-green-fg">
          <Icon className="size-6" aria-hidden />
        </span>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

/** Buka Laporan Data dengan PIN (ADR-018). */
export function UnlockForm({ pinLength, minutes }: { pinLength: number; minutes: number }) {
  const router = useRouter();
  const { pending, submit, error, fieldErrors, clearFieldError } = useServerAction(unlockData, { onSuccess: () => router.refresh() });
  return (
    <GateCard icon={LockKeyhole} title="Laporan Data terkunci" description={`Masukkan PIN Laporan Data. Akses terbuka ${minutes} menit.`}>
      <form onSubmit={submit} onInput={(e) => clearFieldError((e.target as HTMLInputElement).name)} noValidate className="flex flex-col gap-4">
        {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} /> : null}
        <Field id="pin" label="PIN Laporan Data" error={fieldErrors.pin}>
          {(p) => (
            <Input
              {...p}
              name="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={pinLength}
              autoComplete="off"
              autoFocus
              className="text-center text-lg tracking-[0.5em]"
            />
          )}
        </Field>
        <Button type="submit" block loading={pending} loadingText="Memeriksa…">
          Buka
        </Button>
      </form>
    </GateCard>
  );
}

/** Buat atau ganti PIN Laporan Data (butuh password akun). */
export function SetPinForm({ pinLength, mode }: { pinLength: number; mode: "create" | "change" }) {
  const router = useRouter();
  const { pending, submit, error, fieldErrors, clearFieldError } = useServerAction(setDataPin, {
    onSuccess: () => {
      router.push("/laporan-data");
      router.refresh();
    },
  });
  return (
    <GateCard
      icon={ShieldCheck}
      title={mode === "create" ? "Buat PIN Laporan Data" : "Ganti PIN Laporan Data"}
      description="PIN ini melindungi Laporan Data bila HP/laptop dipakai orang lain. Konfirmasi dengan password akun Anda."
    >
      <form onSubmit={submit} onInput={(e) => clearFieldError((e.target as HTMLInputElement).name)} noValidate className="flex flex-col gap-4">
        {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} /> : null}
        <Field id="password" label="Password akun" error={fieldErrors.password}>
          {(p) => <Input {...p} name="password" type="password" autoComplete="current-password" />}
        </Field>
        <PinFields pinLength={pinLength} errors={fieldErrors} label="PIN Laporan Data" />
        <Button type="submit" block loading={pending} loadingText="Menyimpan…">
          Simpan PIN
        </Button>
      </form>
    </GateCard>
  );
}
