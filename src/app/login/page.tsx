import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
    <main className="flex min-h-dvh flex-col bg-brand-800">
      <header className="px-4 pb-8 pt-12 text-white">
        <div className="mx-auto max-w-sm">
          <p className="text-2xl font-bold tracking-wide">MY PASKAM</p>
          <p className="mt-1 text-sm text-brand-100">Pencatatan operasional lapangan</p>
        </div>
      </header>
      <section className="flex-1 rounded-t-2xl bg-canvas px-4 py-6">
        <div className="mx-auto max-w-sm">
          <LoginForm pinLength={AUTH_CONFIG.pinLength} sessionExpired={sesi === "berakhir"} />
        </div>
      </section>
    </main>
  );
}
