import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Laporan Data" };

export default function Page() {
  return <ModulePlaceholder href="/laporan-data" />;
}
