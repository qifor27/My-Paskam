import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SYNC_STATUSES, SYNC_STATUS_LABEL } from "@/lib/sync";

export const metadata = { title: "UI Reference" };

// Referensi komponen untuk development; tidak tersedia di produksi.
export default function UiReferencePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-6">
      <h1 className="text-xl font-semibold">UI Reference</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase text-ink-muted">Button</h2>
        <div className="flex flex-wrap gap-3">
          <Button>
            <Plus aria-hidden /> TAMBAH LAPORAN
          </Button>
          <Button variant="secondary">BATAL</Button>
          <Button variant="danger">
            <Trash2 aria-hidden /> HAPUS
          </Button>
          <Button variant="ghost">
            <ClipboardList aria-hidden /> Lihat detail
          </Button>
          <Button disabled>SIMPAN</Button>
          <Button loading loadingText="MENYIMPAN...">
            SIMPAN
          </Button>
        </div>
        <Button block>MASUK</Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase text-ink-muted">Status sinkronisasi</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {SYNC_STATUSES.map((s) => (
            <li key={s}>
              <code>{s}</code> → {SYNC_STATUS_LABEL[s]}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
