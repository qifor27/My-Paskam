"use client";

import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Ajakan memasang PWA (PRD §19). Android/Chrome: tombol; iPhone: petunjuk Safari. */
export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"hidden" | "prompt" | "ios" | "manual">("hidden");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const timer = setTimeout(() => setMode((m) => (m === "hidden" ? (ios ? "ios" : "manual") : m)), 0);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-tile-blue-bg text-tile-blue-fg">
          <Download className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">Pasang aplikasi di HP</p>
          <p className="text-sm text-ink-muted">Buka lebih cepat dari layar utama dan tetap bisa mengisi data saat offline.</p>
        </div>
      </div>
      {mode === "prompt" && prompt ? (
        <Button
          block
          onClick={async () => {
            await prompt.prompt();
            await prompt.userChoice.catch(() => null);
            setPrompt(null);
            setMode("hidden");
          }}
        >
          <Download aria-hidden /> Pasang aplikasi
        </Button>
      ) : mode === "ios" ? (
        <p className="flex items-center gap-1.5 rounded-[var(--radius-control)] bg-canvas p-3 text-sm">
          Di Safari, ketuk <Share className="inline size-4" aria-label="Bagikan" /> lalu pilih <strong>Tambah ke Layar Utama</strong>.
        </p>
      ) : (
        <p className="rounded-[var(--radius-control)] bg-canvas p-3 text-sm">
          Buka menu browser lalu pilih <strong>Pasang aplikasi</strong> / <strong>Tambahkan ke layar utama</strong>.
        </p>
      )}
    </Card>
  );
}
