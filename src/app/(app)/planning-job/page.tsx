import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Planning Job" };

export default function Page() {
  return <ModulePlaceholder href="/planning-job" />;
}
