"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";

import { resetPengawasPin, setPengawasActive, updatePengawas } from "../actions";
import { PinFields } from "../pin-fields";

function retryButton(pending: boolean) {
  return (
    <Button type="submit" variant="secondary" size="sm" loading={pending}>
      COBA LAGI
    </Button>
  );
}

export function EditForm({ id, name, kodePengawas }: { id: string; name: string; kodePengawas: string }) {
  const router = useRouter();
  const { pending, submit, error, fieldErrors, succeeded } = useServerAction(updatePengawas, {
    onSuccess: () => router.refresh(),
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      {succeeded ? <Alert tone="success">Perubahan disimpan.</Alert> : null}
      {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} action={retryButton(pending)} /> : null}
      <Field id="name" label="Nama" error={fieldErrors.name}>
        {(p) => <Input {...p} name="name" defaultValue={name} autoComplete="off" />}
      </Field>
      <Field id="kodePengawas" label="Kode Pengawas" error={fieldErrors.kodePengawas}>
        {(p) => (
          <Input
            {...p}
            name="kodePengawas"
            defaultValue={kodePengawas}
            autoCapitalize="characters"
            autoComplete="off"
            className="uppercase"
          />
        )}
      </Field>
      <Button type="submit" loading={pending} loadingText="MENYIMPAN..." className="self-end">
        SIMPAN
      </Button>
    </form>
  );
}

export function PinResetForm({ id, pinLength }: { id: string; pinLength: number }) {
  const { pending, submit, error, fieldErrors, succeeded } = useServerAction(resetPengawasPin, {
    // PIN baru tidak dibiarkan terisi di layar setelah berhasil.
    onSuccess: (_data, form) => form.reset(),
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      {succeeded ? <Alert tone="success">PIN berhasil direset. Beritahukan PIN baru kepada Pengawas.</Alert> : null}
      {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} action={retryButton(pending)} /> : null}
      <PinFields pinLength={pinLength} errors={fieldErrors} label="PIN baru" />
      <Button type="submit" loading={pending} loadingText="MENYIMPAN..." className="self-end">
        RESET PIN
      </Button>
    </form>
  );
}

export function StatusForm({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const { pending, submit, error } = useServerAction(setPengawasActive, {
    onSuccess: () => {
      setConfirming(false);
      router.refresh();
    },
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={String(!isActive)} />
      <p className="text-sm">
        Status saat ini:{" "}
        <strong className={isActive ? "text-success-600" : "text-ink-muted"}>{isActive ? "AKTIF" : "NONAKTIF"}</strong>
      </p>
      {error ? <ErrorAlert error={error} action={retryButton(pending)} /> : null}

      {isActive && confirming ? (
        // Konfirmasi dua langkah untuk aksi yang mengeluarkan user (PRD §22).
        <Alert tone="warning">
          <p>Pengawas tidak akan bisa masuk dan langsung keluar dari semua perangkat. Lanjutkan?</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setConfirming(false)}>
              BATAL
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={pending} loadingText="MENYIMPAN...">
              YA, NONAKTIFKAN
            </Button>
          </div>
        </Alert>
      ) : isActive ? (
        <Button type="button" variant="secondary" className="self-start" onClick={() => setConfirming(true)}>
          NONAKTIFKAN
        </Button>
      ) : (
        <Button type="submit" className="self-start" loading={pending} loadingText="MENYIMPAN...">
          AKTIFKAN
        </Button>
      )}
    </form>
  );
}
