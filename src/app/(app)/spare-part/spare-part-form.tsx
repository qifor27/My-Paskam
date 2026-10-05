"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { FormAlerts } from "@/components/form-alerts";
import { PhotoGrid } from "@/components/photo-grid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceChips } from "@/components/ui/choice-chips";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Textarea } from "@/components/ui/textarea";
import { usePhotoUploads, type PhotoItem } from "@/hooks/use-photo-uploads";
import { requestPersistentStorage } from "@/lib/draft-store";
import { networkError } from "@/lib/errors/client";
import type { PublicError } from "@/lib/errors/public-error";
import { sparePartDrafts, type SparePartFields } from "@/lib/spare-part/draft";
import { PRIORITIES, PRIORITY_META, type Priority } from "@/lib/spare-part/priority";
import { SPARE_PART_RULES } from "@/lib/spare-part/schema";
import { createClientId } from "@/lib/sync/client-id";

import { saveSparePart } from "./actions";

type Props = {
  mode: "create" | "edit";
  id?: string;
  units: { id: string; name: string }[];
  suggestions: { partNames: string[]; lokasi: string[] };
  initialFields?: SparePartFields;
  initialPhotos?: { id: string; width: number; height: number }[];
};

const EMPTY: SparePartFields = { unitId: "", partName: "", partNumber: "", quantity: "1", priority: "SEDANG", kerusakan: "", lokasi: "" };
const FIELD_ORDER = ["unitId", "partName", "partNumber", "quantity", "priority", "kerusakan", "lokasi", "photoIds"] as const;

/** Memuat draft dari HP (jika ada) sebelum form ditampilkan. */
export function SparePartForm(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; id: string; fields: SparePartFields; photos: PhotoItem[]; restored: boolean }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    requestPersistentStorage();
    const id = props.id ?? createClientId();
    if (props.mode === "create" && !props.id) router.replace(`/spare-part/baru?draft=${id}`, { scroll: false });
    const fromServer: PhotoItem[] = (props.initialPhotos ?? []).map((p) => ({ ...p, status: "uploaded", progress: 100, previewUrl: `/api/foto/${p.id}` }));

    sparePartDrafts
      .get(id)
      .catch(() => undefined)
      .then((draft) => {
        if (cancelled) return;
        if (draft) {
          const photos: PhotoItem[] = draft.photos.map((p) => ({
            id: p.id,
            width: p.width,
            height: p.height,
            status: p.uploaded ? "uploaded" : "uploading",
            progress: p.uploaded ? 100 : 0,
            previewUrl: p.blob ? URL.createObjectURL(p.blob) : `/api/foto/${p.id}`,
            blob: p.blob,
          }));
          setState({ status: "ready", id, fields: { ...EMPTY, ...draft.fields }, photos, restored: true });
        } else {
          setState({ status: "ready", id, fields: props.initialFields ?? EMPTY, photos: fromServer, restored: false });
        }
      });
    return () => {
      cancelled = true;
    };
    // Hanya saat pertama dibuka.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.status === "loading") {
    return <div className="h-96 animate-pulse rounded-[var(--radius-card)] bg-border/60 motion-reduce:animate-none" role="status" aria-label="Memuat form" />;
  }
  return <Inner key={state.id} {...props} id={state.id} initial={state.fields} initialPhotos={state.photos} restored={state.restored} />;
}

function Inner({
  mode,
  id,
  units,
  suggestions,
  initial,
  initialPhotos,
  restored,
}: Omit<Props, "id" | "initialFields" | "initialPhotos"> & { id: string; initial: SparePartFields; initialPhotos: PhotoItem[]; restored: boolean }) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  const [dirty, setDirty] = useState(restored);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<PublicError | null>(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const photos = usePhotoUploads(id, initialPhotos, "ORDER_SPARE_PART");
  const formRef = useRef<HTMLFormElement>(null);
  // Setelah tersimpan di server, autosave yang masih tertunda tidak boleh
  // menulis draft lagi (race: foto selesai → Simpan langsung ditekan).
  const savedRef = useRef(false);
  const fieldErrors = error?.fieldErrors ?? {};

  const clearFieldError = (key: string) =>
    setError((prev) => {
      if (!prev?.fieldErrors?.[key]) return prev;
      return { ...prev, fieldErrors: Object.fromEntries(Object.entries(prev.fieldErrors).filter(([k]) => k !== key)) };
    });
  const set = <K extends keyof SparePartFields>(key: K, value: SparePartFields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    setDirty(true);
    clearFieldError(key);
  };

  // Simpan otomatis ke HP (PRD §23).
  useEffect(() => {
    if (!dirty && photos.items.length === initialPhotos.length) return;
    const timer = setTimeout(() => {
      if (savedRef.current) return;
      sparePartDrafts
        .save({
          id,
          mode,
          updatedAt: Date.now(),
          fields,
          photos: photos.items
            .filter((p) => p.status === "uploaded" || p.blob)
            .map((p) => ({ id: p.id, width: p.width, height: p.height, uploaded: p.status === "uploaded", blob: p.blob })),
        })
        .then(() => setSavedLocally(true))
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
  }, [dirty, fields, photos.items, id, mode, initialPhotos.length]);

  async function discardDraft() {
    await sparePartDrafts.remove(id).catch(() => {});
    window.location.reload();
  }

  const fail = (fe: Record<string, string>) => setError({ category: "VALIDATION", message: "", errorId: "", retryable: false, fieldErrors: fe });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (photos.busy) return fail({ photoIds: "Tunggu sampai semua foto selesai diunggah." });
    if (photos.failedCount > 0) return fail({ photoIds: "Ada foto yang gagal diunggah. Ketuk Coba lagi atau hapus foto tersebut." });

    const body = new FormData();
    body.set("id", id);
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    body.set("photoIds", photos.items.filter((p) => p.status === "uploaded").map((p) => p.id).join(","));

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof saveSparePart>>;
      try {
        result = navigator.onLine ? await saveSparePart(body) : { ok: false, error: networkError() };
      } catch {
        result = { ok: false, error: networkError() };
      }
      if (result.ok) {
        savedRef.current = true;
        await sparePartDrafts.remove(id).catch(() => {});
        router.push(`/spare-part/${id}?tersimpan=${result.data.created ? "baru" : "ubah"}`);
        router.refresh();
        return;
      }
      setError(result.error);
      const first = FIELD_ORDER.find((k) => result.error.fieldErrors?.[k]);
      if (first) {
        const el = formRef.current?.querySelector<HTMLElement>(`#${first}, [name="${first}"]`);
        el?.focus();
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormAlerts error={error} pending={pending} restored={restored} mode={mode} onDiscard={discardDraft} draftsHref="/spare-part" />

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-base font-semibold">Spare part rusak</h2>
        <Field id="unitId" label="Unit" error={fieldErrors.unitId}>
          {(p) => (
            <ChoiceChips
              name="unitId"
              labelledBy={p.id}
              describedBy={p["aria-describedby"]}
              invalid={p["aria-invalid"]}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
              value={fields.unitId}
              onChange={(v) => set("unitId", v)}
            />
          )}
        </Field>
        <Field id="partName" label="Nama spare part" error={fieldErrors.partName}>
          {(p) => (
            <>
              <Input
                {...p}
                value={fields.partName}
                onChange={(e) => set("partName", e.target.value)}
                list="part-suggestions"
                autoComplete="off"
                maxLength={SPARE_PART_RULES.partNameMax}
                placeholder="Contoh: Filter oli"
              />
              <datalist id="part-suggestions">
                {suggestions.partNames.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </>
          )}
        </Field>
        <Field id="partNumber" label="Nomor part (opsional)" error={fieldErrors.partNumber}>
          {(p) => (
            <Input
              {...p}
              value={fields.partNumber}
              onChange={(e) => set("partNumber", e.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={SPARE_PART_RULES.partNumberMax}
              placeholder="Contoh: 600-211-1340"
              className="tabular-nums"
            />
          )}
        </Field>
        <Field id="quantity" label="Jumlah" error={fieldErrors.quantity}>
          {(p) => (
            <QuantityInput
              id={p.id}
              value={fields.quantity}
              onChange={(v) => set("quantity", v)}
              invalid={p["aria-invalid"]}
              describedBy={p["aria-describedby"]}
              max={SPARE_PART_RULES.quantityMax}
            />
          )}
        </Field>
        <Field id="priority" label="Prioritas" error={fieldErrors.priority}>
          {(p) => (
            <ChoiceChips
              name="priority"
              labelledBy={p.id}
              describedBy={p["aria-describedby"]}
              invalid={p["aria-invalid"]}
              options={PRIORITIES.map((v) => ({ value: v, label: PRIORITY_META[v].label }))}
              value={fields.priority as Priority}
              onChange={(v) => set("priority", v)}
            />
          )}
        </Field>
        <Field id="kerusakan" label="Deskripsi kerusakan" error={fieldErrors.kerusakan}>
          {(p) => (
            <Textarea
              {...p}
              value={fields.kerusakan}
              onChange={(e) => set("kerusakan", e.target.value)}
              maxLength={SPARE_PART_RULES.kerusakanMax}
              placeholder="Apa yang rusak dan bagaimana kondisinya"
            />
          )}
        </Field>
        <Field id="lokasi" label="Lokasi" error={fieldErrors.lokasi}>
          {(p) => (
            <>
              <Input
                {...p}
                value={fields.lokasi}
                onChange={(e) => set("lokasi", e.target.value)}
                list="sp-lokasi-suggestions"
                autoComplete="off"
                maxLength={SPARE_PART_RULES.lokasiMax}
                placeholder="Contoh: Workshop"
              />
              <datalist id="sp-lokasi-suggestions">
                {suggestions.lokasi.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </>
          )}
        </Field>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 id="photoIds" tabIndex={-1} className="text-base font-semibold outline-none">
          Foto kerusakan
        </h2>
        <PhotoGrid
          items={photos.items}
          onAdd={(files) => {
            setDirty(true);
            clearFieldError("photoIds");
            void photos.addFiles(files);
          }}
          onRetry={photos.retry}
          onRemove={(pid) => {
            setDirty(true);
            photos.remove(pid);
          }}
          invalid={Boolean(fieldErrors.photoIds)}
        />
        {fieldErrors.photoIds ? (
          <p className="text-sm font-medium text-danger-800" role="alert">
            {fieldErrors.photoIds}
          </p>
        ) : null}
      </Card>

      <StickyActionBar>
        <Button type="button" variant="secondary" onClick={() => router.push(mode === "edit" ? `/spare-part/${id}` : "/spare-part")}>
          {mode === "edit" ? "Batal" : "Tutup"}
        </Button>
        <Button type="submit" loading={pending} loadingText="Menyimpan…" disabled={photos.busy}>
          <Save aria-hidden /> {photos.busy ? "Menunggu foto…" : "Simpan"}
        </Button>
      </StickyActionBar>
      {savedLocally && dirty ? (
        <p className="-mt-2 text-center text-xs text-ink-muted" aria-live="polite">
          Draft tersimpan otomatis di HP
        </p>
      ) : null}
    </form>
  );
}
