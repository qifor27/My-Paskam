"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import { cn } from "@/lib/utils";

import { login } from "./actions";

type Mode = "PENGAWAS" | "OWNER";

export function LoginForm({ pinLength, sessionExpired }: { pinLength: number; sessionExpired: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("PENGAWAS");
  const { pending, submit, error, fieldErrors, reset } = useServerAction(login, {
    onSuccess: (data) => router.replace(data.redirectTo),
  });

  function switchMode(next: Mode) {
    setMode(next);
    reset();
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="radiogroup"
        aria-label="Masuk sebagai"
        className="grid grid-cols-2 gap-1 rounded-full border border-border bg-surface p-1 shadow-card"
      >
        {(["PENGAWAS", "OWNER"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              "h-11 rounded-full text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20",
              mode === m ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:text-ink",
            )}
          >
            {m === "PENGAWAS" ? "Pengawas" : "Owner"}
          </button>
        ))}
      </div>

      {sessionExpired && !error ? (
        <Alert tone="info">Sesi Anda telah berakhir. Silakan login kembali.</Alert>
      ) : null}
      {error && error.category !== "VALIDATION" ? <ErrorAlert error={error} /> : null}

      {/* key: ganti mode = form baru, agar field Owner/Pengawas tidak tercampur. */}
      <form key={mode} onSubmit={submit} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="mode" value={mode} />
        {mode === "PENGAWAS" ? (
          <>
            <Field id="kodePengawas" label="Kode Pengawas" error={fieldErrors.kodePengawas}>
              {(p) => (
                <Input
                  {...p}
                  name="kodePengawas"
                  placeholder="SPV001"
                  autoComplete="username"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  className="uppercase"
                />
              )}
            </Field>
            <Field id="pin" label="PIN" error={fieldErrors.pin}>
              {(p) => (
                <Input
                  {...p}
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={pinLength}
                  autoComplete="current-password"
                  className="tracking-[0.4em]"
                />
              )}
            </Field>
          </>
        ) : (
          <>
            <Field id="identifier" label="Email / Username" error={fieldErrors.identifier}>
              {(p) => (
                <Input
                  {...p}
                  name="identifier"
                  placeholder="owner@perusahaan.com"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              )}
            </Field>
            <Field id="password" label="Password" error={fieldErrors.password}>
              {(p) => <Input {...p} name="password" type="password" autoComplete="current-password" />}
            </Field>
          </>
        )}
        <Button type="submit" size="lg" block loading={pending} loadingText="Memeriksa…" className="mt-2">
          Masuk <ArrowRight aria-hidden />
        </Button>
      </form>
    </div>
  );
}
