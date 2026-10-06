"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { FormAlerts } from "@/components/form-alerts";
import { PhotoGrid } from "@/components/photo-grid";
import { SelectedUnit, UnitPicker } from "@/components/unit-picker";
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
import { zodFieldErrors } from "@/lib/errors/zod-client";
import { notifyDraftsChanged } from "@/lib/sync/draft-types";
import type { PublicError } from "@/lib/errors/public-error";
import { sparePartDrafts, type SparePartFields } from "@/lib/spare-part/draft";
import { PRIORITIES, PRIORITY_META, type Priority } from "@/lib/spare-part/priority";
import { SPARE_PART_RULES, sparePartSchema } from "@/lib/spare-part/schema";
import { createClientId } from "@/lib/sync/client-id";

import { saveSparePart } from "./actions";

type Props = {
  mode: "create" | "edit";
  /** Pemilik draft di HP (perangkat bisa dipakai bergantian, ADR-019). */
  userId: string;
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
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; id: string; fields: SparePartFields; photos: PhotoItem[]; restored: boolean }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    requestPersistentStorage();
    // Halaman form bisa berasal dari cache offline (tanpa ?draft= di props server),
    // jadi id draft dibaca dari URL di browser. URL diperbarui dengan replaceState
    // (bukan router.replace) agar tidak memicu navigasi yang gagal saat offline.
    const search = new URLSearchParams(window.location.search);
    const fromUrl = props.mode === "create" ? search.get("draft") : null;
    // Unit yang sudah dipilih (langkah pilih unit) ikut di URL agar tahan muat ulang.
    const unitFromUrl = props.mode === "create" ? search.get("unit") : null;
    const presetUnit = unitFromUrl && props.units.some((u) => u.id === unitFromUrl) ? unitFromUrl : "";
    const id = props.id ?? (fromUrl && /^[0-9a-f-]{36}$/i.test(fromUrl) ? fromUrl : createClientId());
    if (props.mode === "create" && fromUrl !== id)
      window.history.replaceState(window.history.state, "", `/spare-part/baru?draft=${id}${presetUnit ? `&unit=${presetUnit}` : ""}`);
    const fromServer: PhotoItem[] = (props.initialPhotos ?? []).map((p) => ({ ...p, status: "uploaded", progress: 100, previewUrl: `/api/foto/${p.id}` }));

    sparePartDrafts
      .get(id)
      .catch(() => undefined)
      .then((found) => {
        if (cancelled) return;
        // Draft milik akun lain (HP dipakai bergantian) tidak dibuka.
        const draft = found && found.userId === props.userId ? found : undefined;
        if (found && !draft && props.mode === "create") {
          const fresh = createClientId();
          window.history.replaceState(window.history.state, "", `/spare-part/baru?draft=${fresh}`);
          setState({ status: "ready", id: fresh, fields: props.initialFields ?? { ...EMPTY, unitId: presetUnit }, photos: [], restored: false });
          return;
        }
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
          setState({ status: "ready", id, fields: props.initialFields ?? { ...EMPTY, unitId: presetUnit }, photos: fromServer, restored: false });
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
  userId,
  id,
  units,
  suggestions,
  initial,
  initialPhotos,
  restored,
}: Omit<Props, "id" | "initialFields" | "initialPhotos"> & { id: string; initial: SparePartFields; initialPhotos: PhotoItem[]; restored: boolean }) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  // Buat baru tanpa unit → tampilkan pilihan unit dulu (permintaan Owner 2026-10-06).
  const [picking, setPicking] = useState(mode === "create" && !initial.unitId);
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
          userId,
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
  }, [dirty, fields, photos.items, id, mode, userId, initialPhotos.length]);

  /** Simpan ke antrean kirim; outbox mengirim otomatis saat online (ADR-019). */
  async function queueForSync() {
    savedRef.current = true;
    await sparePartDrafts
      .save({
        id,
        userId,
        mode,
        updatedAt: Date.now(),
        fields,
        photos: photos.items
          .filter((p) => p.status === "uploaded" || p.blob)
          .map((p) => ({ id: p.id, width: p.width, height: p.height, uploaded: p.status === "uploaded", blob: p.blob })),
        sync: { status: "queued", queuedAt: Date.now() },
      })
      .catch(() => {});
    notifyDraftsChanged();
    router.push("/spare-part?antre=1");
    router.refresh();
  }

  function showFieldErrors(fe: Record<string, string>) {
    setError({ category: "VALIDATION", message: "", errorId: "", retryable: false, fieldErrors: fe });
    const first = FIELD_ORDER.find((k) => fe[k]);
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`#${first}, [name="${first}"]`);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  async function discardDraft() {
    await sparePartDrafts.remove(id).catch(() => {});
    window.location.reload();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (photos.busy) return showFieldErrors({ photoIds: "Tunggu sampai semua foto selesai diproses." });
    if (photos.rejectedCount > 0) return showFieldErrors({ photoIds: "Ada foto yang ditolak. Hapus foto tersebut lalu coba lagi." });

    // Validasi di HP dengan schema yang sama dengan server: tetap jalan saat offline.
    const allPhotoIds = photos.items.map((p) => p.id).join(",");
    const check = sparePartSchema.safeParse({ id, ...fields, photoIds: allPhotoIds });
    if (!check.success) return showFieldErrors(zodFieldErrors(check.error));

    // Offline, atau ada foto yang tertunda karena jaringan → antrean kirim.
    if (!navigator.onLine || photos.items.some((p) => p.status !== "uploaded")) {
      void queueForSync();
      return;
    }

    const body = new FormData();
    body.set("id", id);
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    body.set("photoIds", allPhotoIds);

    startTransition(async () => {
      let result: Awaited<ReturnType<typeof saveSparePart>>;
      try {
        result = await saveSparePart(body);
      } catch {
        result = { ok: false, error: networkError() };
      }
      if (result.ok) {
        savedRef.current = true;
        await sparePartDrafts.remove(id).catch(() => {});
        notifyDraftsChanged();
        router.push(`/spare-part/${id}?tersimpan=${result.data.created ? "baru" : "ubah"}`);
        router.refresh();
        return;
      }
      if (result.error.category === "NETWORK") {
        await queueForSync();
        return;
      }
      setError(result.error);
      if (result.error.fieldErrors) showFieldErrors(result.error.fieldErrors);
    });
  }

  function chooseUnit(unitId: string) {
    const changed = Boolean(fields.unitId) && fields.unitId !== unitId;
    setFields((f) => ({ ...f, unitId }));
    // Pilihan unit pertama belum dianggap isian (tidak membuat draft kosong).
    if (changed) setDirty(true);
    clearFieldError("unitId");
    setPicking(false);
    if (mode === "create") window.history.replaceState(window.history.state, "", `/spare-part/baru?draft=${id}&unit=${unitId}`);
    window.scrollTo({ top: 0 });
  }

  if (picking) {
    return (
      <UnitPicker
        units={units}
        title="Pilih unit"
        description="Spare part yang rusak ada di unit mana?"
        selectedId={fields.unitId}
        onSelect={chooseUnit}
        onCancel={fields.unitId ? () => setPicking(false) : undefined}
      />
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormAlerts error={error} pending={pending} restored={restored} mode={mode} onDiscard={discardDraft} draftsHref="/spare-part" />

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-base font-semibold">Spare part rusak</h2>
        <Field id="unitId" label="Unit" error={fieldErrors.unitId}>
          {(p) => (
            <SelectedUnit buttonId={p.id} unit={units.find((u) => u.id === fields.unitId)} onChange={() => setPicking(true)} invalid={p["aria-invalid"]} />
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
