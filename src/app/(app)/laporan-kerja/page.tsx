import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Laporan Kerja" };

export default function Page() {
  return <ModulePlaceholder href="/laporan-kerja" />;
}
