import Link from "next/link";

import { Alert } from "@/components/ui/alert";

// PRD §21 Authorization Error: pesan jelas, bukan error teknis.
export function AccessDenied() {
  return (
    <div className="flex flex-col gap-4">
      <Alert tone="error">Anda tidak memiliki akses untuk membuka halaman ini.</Alert>
      <Link href="/" className="text-sm font-medium text-brand-700 underline underline-offset-4">
        Kembali ke beranda
      </Link>
    </div>
  );
}
