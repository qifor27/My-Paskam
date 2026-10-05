"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ErrorAlert } from "@/components/error-alert";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { PENGAWAS_ACTION_LABEL, PLANNING_STATUS_META, type PlanningStatus } from "@/lib/planning/status";

import { setPlanningStatus } from "./actions";

/**
 * Tombol ubah status. Pengawas: satu aksi utama ("Mulai pekerjaan" /
 * "Tandai selesai"). Owner: semua transisi, "Batalkan" dengan konfirmasi.
 */
export function StatusActions({ id, allowed, role }: { id: string; allowed: PlanningStatus[]; role: "SUPER_ADMIN" | "PENGAWAS" }) {
  const router = useRouter();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [target, setTarget] = useState<PlanningStatus | null>(null);
  const { pending, submit, error } = useServerAction(setPlanningStatus, {
    onSuccess: () => {
      setConfirmCancel(false);
      router.refresh();
    },
  });
  if (allowed.length === 0) return null;

  const forward = allowed.filter((s) => s !== "DIBATALKAN");
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      {error ? <ErrorAlert error={error} /> : null}

      {forward.map((s, i) => (
        <Button
          key={s}
          type="submit"
          name="status"
          value={s}
          block
          size={role === "PENGAWAS" ? "lg" : "md"}
          variant={i === 0 ? "primary" : "secondary"}
          loading={pending && target === s}
          disabled={pending}
          onClick={() => setTarget(s)}
        >
          {role === "PENGAWAS" ? (PENGAWAS_ACTION_LABEL[s] ?? PLANNING_STATUS_META[s].label) : `Ubah ke ${PLANNING_STATUS_META[s].label}`}
        </Button>
      ))}

      {allowed.includes("DIBATALKAN") ? (
        confirmCancel ? (
          <Alert tone="error">
            <p>Batalkan planning ini? Pengawas akan melihatnya sebagai dibatalkan.</p>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmCancel(false)}>
                Kembali
              </Button>
              <Button
                type="submit"
                name="status"
                value="DIBATALKAN"
                variant="danger"
                size="sm"
                loading={pending && target === "DIBATALKAN"}
                onClick={() => setTarget("DIBATALKAN")}
              >
                Ya, batalkan
              </Button>
            </div>
          </Alert>
        ) : (
          <Button type="button" variant="danger-outline" block onClick={() => setConfirmCancel(true)}>
            Batalkan planning
          </Button>
        )
      ) : null}
    </form>
  );
}
