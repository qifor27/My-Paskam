"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { logout } from "@/app/login/actions";
import { postToServiceWorker } from "@/components/sw-register";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="danger-outline"
      block
      loading={pending}
      loadingText="Keluar…"
      onClick={() =>
        startTransition(async () => {
          // Jika server tidak terjangkau, tetap arahkan ke /login agar user tidak terjebak.
          await logout().catch(() => null);
          // Buang halaman ber-data user dari cache offline (perangkat bersama).
          await postToServiceWorker({ type: "CLEAR_USER_CACHE" }).catch(() => {});
          try {
            sessionStorage.removeItem("paskam:warmed");
          } catch {}
          router.replace("/login");
          router.refresh();
        })
      }
    >
      <LogOut aria-hidden /> Keluar
    </Button>
  );
}
