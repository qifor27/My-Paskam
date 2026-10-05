import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BrandMark, Wordmark } from "@/components/brand";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { getCurrentUser } from "@/lib/auth/session";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Masuk" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sesi?: string }>;
}) {
  if (await getCurrentUser()) redirect("/");
  const { sesi } = await searchParams;

  return (
    <main className="flex min-h-dvh flex-col items-center px-4 pb-10 pt-[calc(3.5rem+env(safe-area-inset-top))]">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandMark size="lg" />
          <div>
            <h1>
              <Wordmark className="text-3xl" />
            </h1>
            <p className="mt-1 text-sm text-ink-muted">Pencatatan operasional lapangan</p>
          </div>
        </div>
        <LoginForm pinLength={AUTH_CONFIG.pinLength} sessionExpired={sesi === "berakhir"} />
      </div>
    </main>
  );
}
