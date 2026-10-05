"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RetryButton() {
  return (
    <Button block onClick={() => window.location.reload()}>
      <RefreshCw aria-hidden /> Coba lagi
    </Button>
  );
}
