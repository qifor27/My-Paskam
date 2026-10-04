import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/module-placeholder";

export const metadata: Metadata = { title: "Order Spare Part" };

export default function Page() {
  return <ModulePlaceholder href="/spare-part" />;
}
