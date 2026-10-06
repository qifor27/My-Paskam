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
import { Textarea } from "@/components/ui/textarea";
import { usePhotoUploads, type PhotoItem } from "@/hooks/use-photo-uploads";
import { requestPersistentStorage } from "@/lib/draft-store";
import { networkError } from "@/lib/errors/client";
import { zodFieldErrors } from "@/lib/errors/zod-client";
import { notifyDraftsChanged } from "@/lib/sync/draft-types";
import type { PublicError } from "@/lib/errors/public-error";
import { shiftISO } from "@/lib/format";
import { laporanDrafts, type LaporanFields } from "@/lib/laporan-kerja/draft";
import { LAPORAN_RULES, laporanSchema } from "@/lib/laporan-kerja/schema";
import { createClientId } from "@/lib/sync/client-id";

import { saveLaporan } from "./actions";

type Unit = { id: string; name: string };
type Props = {
  mode: "create" | "edit";
  /** Pemilik draft di HP (perangkat bisa dipakai bergantian, ADR-019). */
  userId: string;
  /** Edit: id laporan. Create: id draft dari URL (jika melanjutkan draft). */
  id?: string;
  today: string;
  units: Unit[];
  suggestions: { operators: string[]; lokasi: string[] };
  initialFields?: LaporanFields;
  initialPhotos?: { id: string; width: number; height: number }[];
};

const EMPTY = (today: string): LaporanFields => ({
  tanggal: today,
  unitId: "",
  operatorName: "",
  hmJam: "",
  bbm: "",
  lokasi: "",
  deskripsi: "",
});

const FIELD_ORDER = ["tanggal", "unitId", "operatorName", "hmJam", "bbm", "lokasi", "deskripsi", "photoIds"] as const;

/** Memuat draft dari HP (jika ada) sebelum form ditampilkan. */
export function LaporanForm(props: Props) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; id: string; fields: LaporanFields; photos: PhotoItem[]; restored: boolean }
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
      window.history.replaceState(window.history.state, "", `/laporan-kerja/baru?draft=${id}${presetUnit ? `&unit=${presetUnit}` : ""}`);

    const fromServer: PhotoItem[] = (props.initialPhotos ?? []).map((p) => ({
      ...p,
      status: "uploaded",
      progress: 100,
      previewUrl: `/api/foto/${p.id}`,
    }));

    laporanDrafts
      .get(id)
      .catch(() => undefined)
      .then((found) => {
        if (cancelled) return;
        // Draft milik akun lain (HP dipakai bergantian) tidak dibuka.
        const draft = found && found.userId === props.userId ? found : undefined;
        if (found && !draft && props.mode === "create") {
          const fresh = createClientId();
          window.history.replaceState(window.history.state, "", `/laporan-kerja/baru?draft=${fresh}`);
          setState({ status: "ready", id: fresh, fields: props.initialFields ?? { ...EMPTY(props.today), unitId: presetUnit }, photos: [], restored: false });
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
          setState({ status: "ready", id, fields: draft.fields, photos, restored: true });
        } else {
          setState({ status: "ready", id, fields: props.initialFields ?? { ...EMPTY(props.today), unitId: presetUnit }, photos: fromServer, restored: false });
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

  return (
    <LaporanFormInner
      key={state.id}
      {...props}
      id={state.id}
      initial={state.fields}
      initialPhotos={state.photos}
      restored={state.restored}
    />
  );
}

function LaporanFormInner({
  mode,
  userId,
  id,
  today,
  units,
  suggestions,
  initial,
  initialPhotos,
  restored,
}: Omit<Props, "id" | "initialFields" | "initialPhotos"> & {
  id: string;
  initial: LaporanFields;
  initialPhotos: PhotoItem[];
  restored: boolean;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(initial);
  // Buat baru tanpa unit → tampilkan pilihan unit dulu (permintaan Owner 2026-10-06).
  const [picking, setPicking] = useState(mode === "create" && !initial.unitId);
  const [dirty, setDirty] = useState(restored);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<PublicError | null>(null);
  const [savedLocally, setSavedLocally] = useState(false);
  const photos = usePhotoUploads(id, initialPhotos);
  const formRef = useRef<HTMLFormElement>(null);
  // Setelah tersimpan di server, autosave yang masih tertunda tidak boleh
  // menulis draft lagi (race: foto selesai → Simpan langsung ditekan).
  const savedRef = useRef(false);
  const fieldErrors = error?.fieldErrors ?? {};

  // Error sebuah field hilang begitu field itu diubah ("reward early", riset UX).
  const clearFieldError = (key: string) =>
    setError((prev) => {
      if (!prev?.fieldErrors?.[key]) return prev;
      const rest = Object.fromEntries(Object.entries(prev.fieldErrors).filter(([k]) => k !== key));
      return { ...prev, fieldErrors: rest };
    });

  const set = <K extends keyof LaporanFields>(key: K, value: LaporanFields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    setDirty(true);
    clearFieldError(key);
  };

  // Simpan otomatis ke HP (PRD §23): isian & foto yang belum terunggah tidak hilang.
  useEffect(() => {
    if (!dirty && photos.items.length === initialPhotos.length) return;
    const timer = setTimeout(() => {
      if (savedRef.current) return;
      laporanDrafts
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
    await laporanDrafts
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
    router.push("/laporan-kerja?antre=1");
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
    await laporanDrafts.remove(id).catch(() => {});
    window.location.reload();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (photos.busy) return showFieldErrors({ photoIds: "Tunggu sampai semua foto selesai diproses." });
    if (photos.rejectedCount > 0) return showFieldErrors({ photoIds: "Ada foto yang ditolak. Hapus foto tersebut lalu coba lagi." });

    // Validasi di HP dengan schema yang sama dengan server: tetap jalan saat offline.
    const allPhotoIds = photos.items.map((p) => p.id).join(",");
    const check = laporanSchema(today).safeParse({ id, ...fields, photoIds: allPhotoIds });
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
      let result: Awaited<ReturnType<typeof saveLaporan>>;
      try {
        result = await saveLaporan(body);
      } catch {
        result = { ok: false, error: networkError() };
      }
      if (result.ok) {
        savedRef.current = true;
        await laporanDrafts.remove(id).catch(() => {});
        notifyDraftsChanged();
        router.push(`/laporan-kerja/${id}?tersimpan=${result.data.created ? "baru" : "ubah"}`);
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

  const yesterday = shiftISO(today, -1);

  function chooseUnit(unitId: string) {
    const changed = Boolean(fields.unitId) && fields.unitId !== unitId;
    setFields((f) => ({ ...f, unitId }));
    // Pilihan unit pertama belum dianggap isian (tidak membuat draft kosong).
    if (changed) setDirty(true);
    clearFieldError("unitId");
    setPicking(false);
    if (mode === "create") window.history.replaceState(window.history.state, "", `/laporan-kerja/baru?draft=${id}&unit=${unitId}`);
    window.scrollTo({ top: 0 });
  }

  if (picking) {
    return (
      <UnitPicker
        units={units}
        title="Pilih unit"
        description="Laporan kerja ini untuk unit mana?"
        selectedId={fields.unitId}
        onSelect={chooseUnit}
        onCancel={fields.unitId ? () => setPicking(false) : undefined}
      />
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormAlerts error={error} pending={pending} restored={restored} mode={mode} onDiscard={discardDraft} draftsHref="/laporan-kerja" />

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-base font-semibold">Pekerjaan</h2>
        <Field id="unitId" label="Unit" error={fieldErrors.unitId}>
          {(p) => (
            <SelectedUnit buttonId={p.id} unit={units.find((u) => u.id === fields.unitId)} onChange={() => setPicking(true)} invalid={p["aria-invalid"]} />
          )}
        </Field>
        <Field id="tanggal" label="Tanggal" error={fieldErrors.tanggal}>
          {(p) => (
            <div className="flex flex-col gap-2">
              <ChoiceChips
                name="tanggal-cepat"
                labelledBy="tanggal"
                options={[
                  { value: today, label: "Hari ini" },
                  { value: yesterday, label: "Kemarin" },
                ]}
                value={fields.tanggal === today || fields.tanggal === yesterday ? fields.tanggal : ""}
                onChange={(v) => set("tanggal", v)}
              />
              <Input {...p} type="date" max={today} value={fields.tanggal} onChange={(e) => set("tanggal", e.target.value)} />
            </div>
          )}
        </Field>


        <Field id="operatorName" label="Operator" error={fieldErrors.operatorName}>
          {(p) => (
            <>
              <Input
                {...p}
                value={fields.operatorName}
                onChange={(e) => set("operatorName", e.target.value)}
                list="operator-suggestions"
                autoComplete="off"
                autoCapitalize="words"
                maxLength={LAPORAN_RULES.operatorMax}
                placeholder="Nama operator"
              />
              <datalist id="operator-suggestions">
                {suggestions.operators.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </>
          )}
        </Field>

        <Field id="lokasi" label="Lokasi" error={fieldErrors.lokasi}>
          {(p) => (
            <>
              <Input
                {...p}
                value={fields.lokasi}
                onChange={(e) => set("lokasi", e.target.value)}
                list="lokasi-suggestions"
                autoComplete="off"
                maxLength={LAPORAN_RULES.lokasiMax}
                placeholder="Contoh: Pit Utara"
              />
              <datalist id="lokasi-suggestions">
                {suggestions.lokasi.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </>
          )}
        </Field>

        <Field id="deskripsi" label="Deskripsi pekerjaan" error={fieldErrors.deskripsi}>
          {(p) => (
            <Textarea
              {...p}
              value={fields.deskripsi}
              onChange={(e) => set("deskripsi", e.target.value)}
              maxLength={LAPORAN_RULES.deskripsiMax}
              placeholder="Pekerjaan yang dilakukan"
            />
          )}
        </Field>
      </Card>

      <Card className="flex flex-col gap-5 p-5">
        <h2 className="text-base font-semibold">Jam kerja & BBM</h2>
        <Field id="hmJam" label="HM (total jam kerja)" error={fieldErrors.hmJam} hint="Contoh: 7,5">
          {(p) => (
            <div className="relative">
              {/* text + inputmode decimal, bukan type=number (riset GOV.UK). */}
              <Input
                {...p}
                inputMode="decimal"
                enterKeyHint="next"
                autoComplete="off"
                value={fields.hmJam}
                onChange={(e) => set("hmJam", e.target.value)}
                placeholder="0"
                className="pr-14 tabular-nums"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-ink-muted">jam</span>
            </div>
          )}
        </Field>
        <Field id="bbm" label="BBM (Solar)" error={fieldErrors.bbm} hint="Jumlah, contoh: 40">
          {(p) => (
            <Input
              {...p}
              inputMode="decimal"
              enterKeyHint="next"
              autoComplete="off"
              value={fields.bbm}
              onChange={(e) => set("bbm", e.target.value)}
              placeholder="0"
              className="tabular-nums"
            />
          )}
        </Field>
      </Card>

      <Card className="flex flex-col gap-4 p-5">
        <h2 id="photoIds" tabIndex={-1} className="text-base font-semibold outline-none">
          Dokumentasi foto
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
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(mode === "edit" ? `/laporan-kerja/${id}` : "/laporan-kerja")}
        >
          {mode === "edit" ? "Batal" : "Tutup"}
        </Button>
        <Button type="submit" loading={pending} loadingText="Menyimpan…" disabled={photos.busy}>
          <Save aria-hidden /> {photos.busy ? "Menunggu foto…" : "Simpan laporan"}
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
