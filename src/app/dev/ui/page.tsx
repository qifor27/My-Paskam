import { Clock, ClipboardList, Plus, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { SYNC_STATUSES, SYNC_STATUS_LABEL } from "@/lib/sync";

export const metadata = { title: "UI Reference" };

// Referensi komponen untuk development; tidak tersedia di produksi.
export default function UiReferencePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-6">
      <h1 className="text-xl font-semibold">UI Reference</h1>

      <Section title="Button">
        <div className="flex flex-wrap gap-3">
          <Button>
            <Plus aria-hidden /> Tambah laporan
          </Button>
          <Button variant="secondary">Batal</Button>
          <Button variant="danger">
            <Trash2 aria-hidden /> Hapus
          </Button>
          <Button variant="ghost">
            <ClipboardList aria-hidden /> Lihat detail
          </Button>
          <Button disabled>Simpan</Button>
          <Button loading loadingText="Menyimpan…">
            Simpan
          </Button>
        </div>
        <Button block size="lg">Masuk</Button>
        <div className="flex flex-wrap gap-3">
          <Button variant="accent">
            <Plus aria-hidden /> Buat baru
          </Button>
          <Button variant="danger-outline">Keluar</Button>
        </div>
      </Section>

      <Section title="Status badge (5 nada)">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="neutral">Draft</StatusBadge>
          <StatusBadge tone="info" icon={Clock}>
            Menunggu
          </StatusBadge>
          <StatusBadge tone="success">Disetujui</StatusBadge>
          <StatusBadge tone="warning">Perlu dicek</StatusBadge>
          <StatusBadge tone="danger">Ditolak</StatusBadge>
        </div>
        <p className="text-sm text-ink-muted">Contoh label saja; daftar status modul menunggu keputusan Owner (Q1, Q8, Q11).</p>
      </Section>

      <Section title="Field & alert">
        <Field id="demo-lokasi" label="Lokasi" error="Lokasi wajib diisi">
          {(p) => <Input {...p} placeholder="Contoh: Pit Utara" />}
        </Field>
        <Field id="demo-hm" label="HM akhir" hint="HM terakhir: 12.480,5">
          {(p) => <Input {...p} inputMode="decimal" className="tabular-nums" placeholder="0,0" />}
        </Field>
        <Alert tone="success">Data berhasil disimpan.</Alert>
        <Alert tone="warning">Koneksi internet terputus. Isian Anda tidak akan dihapus.</Alert>
        <Alert tone="error">Server sedang mengalami gangguan. Data Anda belum dikirim.</Alert>
        <Alert tone="info">Sesi Anda telah berakhir. Silakan login kembali.</Alert>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={ClipboardList}
          title="Belum ada laporan kerja"
          description="Belum ada laporan yang dibuat untuk periode ini."
          action={<Button>Buat laporan</Button>}
        />
      </Section>

      <Section title="Status sinkronisasi">
        <ul className="flex flex-col gap-1 text-sm">
          {SYNC_STATUSES.map((s) => (
            <li key={s}>
              <code>{s}</code> → {SYNC_STATUS_LABEL[s]}
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}
