"use client";

import { Check, Pencil, Plus, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { useServerAction } from "@/hooks/use-server-action";
import { createClientId } from "@/lib/sync/client-id";

import { createUnit, renameUnit, setUnitActive } from "./actions";

export function AddUnitForm() {
  const router = useRouter();
  const [id, setId] = useState(createClientId);
  const { pending, submit, error, fieldErrors } = useServerAction(createUnit, {
    onSuccess: (_d, form) => {
      form.reset();
      setId(createClientId()); // unit berikutnya memakai id baru
      router.refresh();
    },
  });

  return (
    <Card className="p-4">
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} /> : null}
        <Field id="new-unit" label="Tambah unit" error={fieldErrors.name}>
          {(p) => (
            <div className="flex gap-2">
              <Input {...p} name="name" placeholder="Contoh: PASKAM 5" autoCapitalize="characters" className="uppercase" />
              <Button type="submit" loading={pending} className="shrink-0">
                <Plus aria-hidden /> Tambah
              </Button>
            </div>
          )}
        </Field>
      </form>
    </Card>
  );
}

export function UnitRow({ id, name, isActive }: { id: string; name: string; isActive: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const rename = useServerAction(renameUnit, {
    onSuccess: () => {
      setEditing(false);
      router.refresh();
    },
  });
  const toggle = useServerAction(setUnitActive, { onSuccess: () => router.refresh() });
  const error = rename.error ?? toggle.error;

  return (
    <Card className="flex flex-col gap-3 p-4">
      {editing ? (
        <form onSubmit={rename.submit} noValidate className="flex gap-2">
          <input type="hidden" name="id" value={id} />
          <div className="flex-1">
            <Field id={`unit-${id}`} label="Nama unit" error={rename.fieldErrors.name}>
              {(p) => <Input {...p} name="name" defaultValue={name} autoFocus className="uppercase" />}
            </Field>
          </div>
          <div className="flex items-end gap-1">
            <Button type="button" variant="ghost" size="icon" aria-label="Batal" onClick={() => setEditing(false)}>
              <X aria-hidden />
            </Button>
            <Button type="submit" size="icon" aria-label="Simpan" loading={rename.pending}>
              <Check aria-hidden />
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-[var(--radius-control)] bg-tile-blue-bg text-tile-blue-fg">
            <Truck className="size-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 truncate font-semibold">{name}</span>
          <StatusBadge tone={isActive ? "success" : "neutral"}>{isActive ? "Aktif" : "Nonaktif"}</StatusBadge>
          <Button type="button" variant="ghost" size="icon" aria-label={`Ubah nama ${name}`} onClick={() => setEditing(true)}>
            <Pencil aria-hidden />
          </Button>
        </div>
      )}
      {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} /> : null}
      {!editing ? (
        <form onSubmit={toggle.submit}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="active" value={String(!isActive)} />
          <Button type="submit" variant="secondary" size="sm" loading={toggle.pending} block>
            {isActive ? "Nonaktifkan (tidak muncul di form)" : "Aktifkan"}
          </Button>
        </form>
      ) : null}
    </Card>
  );
}
