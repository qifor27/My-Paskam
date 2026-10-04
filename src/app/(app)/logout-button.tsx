"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { logout } from "@/app/login/actions";
import { cn } from "@/lib/utils";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          // Jika server tidak terjangkau, cookie tetap dihapus saat login berikutnya;
          // arahkan ke /login apa pun hasilnya agar user tidak terjebak.
          await logout().catch(() => null);
          router.replace("/login");
          router.refresh();
        })
      }
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-brand-900/40",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        "disabled:opacity-60",
      )}
      aria-label="Keluar"
      title="Keluar"
    >
      <LogOut className="size-5" aria-hidden />
    </button>
  );
}
