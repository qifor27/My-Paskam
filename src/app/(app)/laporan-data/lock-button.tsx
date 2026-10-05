"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { lockData } from "./actions";

export function LockButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          await lockData().catch(() => null);
          router.refresh();
        })
      }
    >
      <Lock aria-hidden /> Kunci
    </Button>
  );
}
