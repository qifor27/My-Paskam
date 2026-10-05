"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { useServerAction } from "@/hooks/use-server-action";
import { createClientId } from "@/lib/sync/client-id";

import { createPengawas } from "../actions";
import { PinFields } from "@/components/pin-fields";

export function PengawasCreateForm({ pinLength }: { pinLength: number }) {
  const router = useRouter();
  // Dibuat sekali per form: retry/kirim ulang memakai id yang sama (ADR-004).
  const [id] = useState(createClientId);
  const { pending, submit, error, fieldErrors } = useServerAction(createPengawas, {
    onSuccess: () => router.push("/pengawas?dibuat=1"),
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      {error && error.category !== "VALIDATION" ? (
        <ErrorAlert
          error={error}
          action={
            <Button type="submit" variant="secondary" size="sm" loading={pending}>
              Coba lagi
            </Button>
          }
        />
      ) : null}

      <Field id="name" label="Nama" error={fieldErrors.name}>
        {(p) => <Input {...p} name="name" autoComplete="off" />}
      </Field>
      <Field id="kodePengawas" label="Kode Pengawas" error={fieldErrors.kodePengawas} hint="Contoh: SPV001">
        {(p) => (
          <Input {...p} name="kodePengawas" autoCapitalize="characters" autoComplete="off" className="uppercase" />
        )}
      </Field>
      <PinFields pinLength={pinLength} errors={fieldErrors} />

      <StickyActionBar>
        <Button type="button" variant="secondary" onClick={() => router.push("/pengawas")}>
          Batal
        </Button>
        <Button type="submit" loading={pending} loadingText="Menyimpan…">
          Simpan
        </Button>
      </StickyActionBar>
    </form>
  );
}
