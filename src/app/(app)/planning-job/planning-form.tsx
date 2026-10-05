"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { useServerAction } from "@/hooks/use-server-action";
import { PLANNING_RULES } from "@/lib/planning/schema";
import { createClientId } from "@/lib/sync/client-id";

import { savePlanning } from "./actions";

type Initial = {
  supervisorId: string;
  unitId: string;
  namaPekerjaan: string;
  lokasi: string;
  deskripsi: string;
  estimasiMulai: string;
  estimasiSelesai: string;
};

// Form Owner (ADR-017). Biasanya diisi di kantor; isian tetap ada saat gagal
// karena form tidak memakai prop `action` (PRD §23).
export function PlanningForm({
  mode,
  id: existingId,
  today,
  pengawas,
  units,
  initial,
}: {
  mode: "create" | "edit";
  id?: string;
  today: string;
  pengawas: { id: string; name: string; kodePengawas: string | null }[];
  units: { id: string; name: string }[];
  initial?: Initial;
}) {
  const router = useRouter();
  const [id] = useState(() => existingId ?? createClientId());
  const [unitId, setUnitId] = useState(initial?.unitId ?? "");
  const [mulai, setMulai] = useState(initial?.estimasiMulai ?? today);
  const { pending, submit, error, fieldErrors, clearFieldError } = useServerAction(savePlanning, {
    onSuccess: (data) => {
      router.push(`/planning-job/${data.id}?tersimpan=${data.created ? "baru" : "ubah"}`);
      router.refresh();
    },
  });

  return (
    <form
      onSubmit={submit}
      onInput={(e) => clearFieldError((e.target as HTMLInputElement).name)}
      noValidate
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="id" value={id} />
      {error && error.category !== "VALIDATION" ? (
        <ErrorAlert
          error={error}
          action={
            <Button type="submit" variant="secondary" size="sm" loading={pending} className="self-start">
              Coba lagi
            </Button>
          }
        />
      ) : null}

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-base font-semibold">Pekerjaan</h2>
        <Field id="namaPekerjaan" label="Nama pekerjaan" error={fieldErrors.namaPekerjaan}>
          {(p) => (
            <Input {...p} name="namaPekerjaan" defaultValue={initial?.namaPekerjaan} maxLength={PLANNING_RULES.namaMax} placeholder="Contoh: Perataan jalan hauling" />
          )}
        </Field>
        <Field id="supervisorId" label="Pengawas" error={fieldErrors.supervisorId}>
          {(p) => (
            <Select {...p} name="supervisorId" defaultValue={initial?.supervisorId ?? ""}>
              <option value="" disabled>
                Pilih Pengawas
              </option>
              {pengawas.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                  {u.kodePengawas ? ` (${u.kodePengawas})` : ""}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="unitId" label="Unit" error={fieldErrors.unitId}>
          {(p) => (
            <ChoiceChips
              name="unitId"
              labelledBy={p.id}
              describedBy={p["aria-describedby"]}
              invalid={p["aria-invalid"]}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
              value={unitId}
              onChange={(v) => {
                setUnitId(v);
                clearFieldError("unitId");
              }}
            />
          )}
        </Field>
        <Field id="lokasi" label="Lokasi" error={fieldErrors.lokasi}>
          {(p) => <Input {...p} name="lokasi" defaultValue={initial?.lokasi} maxLength={PLANNING_RULES.lokasiMax} placeholder="Contoh: Pit Utara" />}
        </Field>
        <Field id="deskripsi" label="Deskripsi" error={fieldErrors.deskripsi}>
          {(p) => (
            <Textarea {...p} name="deskripsi" defaultValue={initial?.deskripsi} maxLength={PLANNING_RULES.deskripsiMax} placeholder="Rincian pekerjaan yang harus dilakukan" />
          )}
        </Field>
      </Card>

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-base font-semibold">Jadwal</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="estimasiMulai" label="Estimasi mulai" error={fieldErrors.estimasiMulai}>
            {(p) => <Input {...p} type="date" name="estimasiMulai" value={mulai} onChange={(e) => setMulai(e.target.value)} />}
          </Field>
          <Field id="estimasiSelesai" label="Estimasi selesai" error={fieldErrors.estimasiSelesai}>
            {(p) => <Input {...p} type="date" name="estimasiSelesai" min={mulai} defaultValue={initial?.estimasiSelesai ?? today} />}
          </Field>
        </div>
      </Card>

      <StickyActionBar>
        <Button type="button" variant="secondary" onClick={() => router.push(mode === "edit" ? `/planning-job/${id}` : "/planning-job")}>
          Batal
        </Button>
        <Button type="submit" loading={pending} loadingText="Menyimpan…">
          <Save aria-hidden /> {mode === "edit" ? "Simpan perubahan" : "Simpan planning"}
        </Button>
      </StickyActionBar>
    </form>
  );
}
