import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ReportColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: "right";
  /** Kolom panjang (mis. deskripsi) diberi lebar minimum di desktop. */
  wide?: boolean;
};

/**
 * Tabel Laporan Data: urutan & nama kolom mengikuti lembar Excel Owner
 * (2026-10-06). Desktop = tabel; HP = kartu label/nilai dengan urutan sama.
 */
export function ReportTable<T extends { id: string }>({
  rows,
  columns,
  href,
}: {
  rows: T[];
  columns: ReportColumn<T>[];
  href: (row: T) => string;
}) {
  const th = "px-4 py-3 text-left text-xs font-semibold text-ink-muted whitespace-nowrap";
  const td = "px-4 py-3 align-top";
  return (
    <Card className="overflow-hidden p-0">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm tabular-nums">
          <thead className="border-b border-border">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={cn(th, c.align === "right" && "text-right")}>
                  {c.header}
                </th>
              ))}
              <th className={th}>
                <span className="sr-only">Detail</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-canvas">
                {columns.map((c) => (
                  <td key={c.header} className={cn(td, c.align === "right" && "text-right", c.wide && "min-w-48")}>
                    {c.cell(row)}
                  </td>
                ))}
                <td className={cn(td, "text-right")}>
                  <Link href={href(row)} aria-label="Lihat detail" className="inline-flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-brand-50 hover:text-brand-700">
                    <ChevronRight className="size-5" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="flex flex-col gap-2 p-4">
            <dl className="grid grid-cols-[minmax(6.5rem,auto)_1fr] gap-x-3 gap-y-1.5 text-sm">
              {columns.map((c) => (
                <div key={c.header} className="contents">
                  <dt className="text-ink-muted">{c.header}</dt>
                  <dd className="min-w-0 font-medium tabular-nums">{c.cell(row)}</dd>
                </div>
              ))}
            </dl>
            <Link href={href(row)} className="inline-flex items-center gap-1 self-end text-sm font-semibold text-brand-700">
              Lihat detail <ChevronRight className="size-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Kolom Dokumentasi: foto mini (maks. 3) + jumlah sisa. */
export function PhotoThumbs({ ids, total, alt }: { ids: string[]; total: number; alt: string }) {
  if (total === 0) return <span className="text-ink-muted">-</span>;
  return (
    <span className="flex items-center gap-1.5">
      {ids.map((id) => (
        <a key={id} href={`/api/foto/${id}`} target="_blank" rel="noopener" className="block size-10 shrink-0 overflow-hidden rounded-md border border-border bg-canvas">
          {/* eslint-disable-next-line @next/next/no-img-element -- foto privat lewat route terotorisasi */}
          <img src={`/api/foto/${id}`} alt={alt} loading="lazy" className="size-full object-cover" />
        </a>
      ))}
      {total > ids.length ? <span className="text-xs text-ink-muted">+{total - ids.length}</span> : null}
    </span>
  );
}
