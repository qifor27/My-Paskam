"use client";

import { RotateCw } from "lucide-react";
import Link from "next/link";

import { ErrorAlert } from "@/components/error-alert";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { PublicError } from "@/lib/errors/public-error";

/**
 * Banner status form data lapangan (PRD §21–§23): draft dipulihkan, koneksi
 * putus (data aman di HP), sesi habis, dan error server. Validasi tampil inline.
 */
export function FormAlerts({
  error,
  pending,
  restored,
  mode,
  onDiscard,
  draftsHref,
}: {
  error: PublicError | null;
  pending: boolean;
  restored: boolean;
  mode: "create" | "edit";
  onDiscard: () => void;
  /** Halaman daftar tempat draft "Belum terkirim" tampil. */
  draftsHref: string;
}) {
  return (
    <>
      {restored ? (
        <Alert
          tone="info"
          action={
            <Button type="button" variant="secondary" size="sm" onClick={onDiscard} className="self-start">
              Buang perubahan
            </Button>
          }
        >
          {mode === "edit" ? "Perubahan yang belum terkirim dipulihkan dari HP." : "Melanjutkan draft yang tersimpan di HP."}
        </Alert>
      ) : null}

      {error?.category === "NETWORK" ? (
        <Alert
          tone="warning"
          action={
            <Button type="submit" variant="secondary" size="sm" loading={pending} className="self-start">
              <RotateCw aria-hidden /> Coba kirim lagi
            </Button>
          }
        >
          Koneksi terputus. Data <strong>tersimpan di HP</strong> sebagai draft dan bisa dikirim saat koneksi kembali.
        </Alert>
      ) : error?.category === "SESSION_EXPIRED" ? (
        <Alert tone="warning">
          Sesi Anda telah berakhir. Data tetap tersimpan di HP.{" "}
          <Link href="/login" className="font-semibold underline">
            Login kembali
          </Link>{" "}
          lalu buka draft ini dari{" "}
          <Link href={draftsHref} className="font-semibold underline">
            daftar
          </Link>
          .
        </Alert>
      ) : error && error.category !== "VALIDATION" ? (
        <ErrorAlert
          error={error}
          action={
            <Button type="submit" variant="secondary" size="sm" loading={pending} className="self-start">
              Coba lagi
            </Button>
          }
        />
      ) : null}
    </>
  );
}
