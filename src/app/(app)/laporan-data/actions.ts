"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { parseForm, runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { AUTH_CONFIG } from "@/lib/auth/config";
import { burnVerifyTime, hashSecret, verifySecret } from "@/lib/auth/password";
import { clearRateLimit, dataPinKeys, loginLockRemaining, recordLoginFailure } from "@/lib/auth/rate-limit";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getRequestMeta } from "@/lib/request";

const pin = z.string().regex(new RegExp(`^\\d{${AUTH_CONFIG.pinLength}}$`), `PIN harus ${AUTH_CONFIG.pinLength} digit angka`);

const setPinSchema = z
  .object({ password: z.string().min(1, "Password wajib diisi"), pin, pinConfirm: z.string() })
  .refine((d) => d.pin === d.pinConfirm, { path: ["pinConfirm"], message: "Konfirmasi PIN tidak sama" });

function lockedMessage(ms: number) {
  return `Terlalu banyak percobaan. Coba lagi dalam ${Math.max(1, Math.ceil(ms / 60_000))} menit.`;
}

/** Buat/ganti PIN Laporan Data; wajib password akun (re-autentikasi, ADR-018). */
export async function setDataPin(formData: FormData) {
  return runAction("dataPin.set", async () => {
    const owner = await requirePermission("laporan-data:access");
    const data = parseForm(setPinSchema, formData);
    const keys = dataPinKeys(owner.id);
    const locked = await loginLockRemaining(keys);
    if (locked > 0) throw new AppError("AUTHENTICATION", { userMessage: lockedMessage(locked) });

    const account = await db.user.findUnique({ where: { id: owner.id }, select: { passwordHash: true } });
    const valid = account?.passwordHash ? await verifySecret(data.password, account.passwordHash) : (await burnVerifyTime(data.password), false);
    if (!valid) {
      await recordLoginFailure(keys);
      await audit({ action: "DATA_PIN_FAILED", result: "FAILURE", userId: owner.id, detail: { step: "set", reason: "bad_password" } });
      throw new AppError("VALIDATION", { fieldErrors: { password: "Password tidak sesuai" } });
    }

    await db.user.update({ where: { id: owner.id }, data: { dataPinHash: await hashSecret(data.pin) } });
    // PIN baru → semua sesi terkunci lagi; sesi ini langsung terbuka.
    const until = new Date(Date.now() + AUTH_CONFIG.dataPinUnlockMinutes * 60_000);
    await db.session.updateMany({ where: { userId: owner.id }, data: { dataUnlockedUntil: null } });
    await db.session.update({ where: { id: owner.sessionId }, data: { dataUnlockedUntil: until } });
    await clearRateLimit(keys);
    await audit({ action: "DATA_PIN_SET", result: "SUCCESS", userId: owner.id });
    revalidatePath("/laporan-data");
    return { ok: true };
  });
}

/** Buka Laporan Data untuk sesi ini selama beberapa menit (ADR-018). */
export async function unlockData(formData: FormData) {
  return runAction("dataPin.unlock", async () => {
    const owner = await requirePermission("laporan-data:access");
    const { pin: input } = parseForm(z.object({ pin: z.string().min(1, "PIN wajib diisi") }), formData);
    const { ip } = await getRequestMeta();
    const keys = dataPinKeys(owner.id);
    const locked = await loginLockRemaining(keys);
    if (locked > 0) {
      await audit({ action: "DATA_PIN_LOCKED", result: "FAILURE", userId: owner.id, detail: { ip } });
      throw new AppError("AUTHENTICATION", { userMessage: lockedMessage(locked) });
    }

    const account = await db.user.findUnique({ where: { id: owner.id }, select: { dataPinHash: true } });
    if (!account?.dataPinHash) throw new AppError("VALIDATION", { userMessage: "PIN Laporan Data belum dibuat." });
    if (!(await verifySecret(input, account.dataPinHash))) {
      await recordLoginFailure(keys);
      await audit({ action: "DATA_PIN_FAILED", result: "FAILURE", userId: owner.id, detail: { step: "unlock", ip } });
      throw new AppError("VALIDATION", { fieldErrors: { pin: "PIN tidak sesuai" } });
    }

    const until = new Date(Date.now() + AUTH_CONFIG.dataPinUnlockMinutes * 60_000);
    await db.session.update({ where: { id: owner.sessionId }, data: { dataUnlockedUntil: until } });
    await clearRateLimit(keys);
    await audit({ action: "DATA_UNLOCKED", result: "SUCCESS", userId: owner.id, detail: { ip, minutes: AUTH_CONFIG.dataPinUnlockMinutes } });
    revalidatePath("/laporan-data");
    return { until: until.toISOString() };
  });
}

export async function lockData() {
  return runAction("dataPin.lock", async () => {
    const owner = await requirePermission("laporan-data:access");
    await db.session.update({ where: { id: owner.sessionId }, data: { dataUnlockedUntil: null } });
    await audit({ action: "DATA_LOCKED", result: "SUCCESS", userId: owner.id });
    revalidatePath("/laporan-data");
    return { ok: true };
  });
}
