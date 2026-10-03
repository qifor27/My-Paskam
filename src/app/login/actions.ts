"use server";

import { runAction, parseForm } from "@/lib/action";
import { audit } from "@/lib/audit";
import { burnVerifyTime, verifySecret } from "@/lib/auth/password";
import {
  clearLoginFailures,
  loginKeys,
  loginLockRemaining,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { ownerLoginSchema, pengawasLoginSchema } from "@/lib/auth/validation";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getRequestMeta } from "@/lib/request";

type LoginMode = "PENGAWAS" | "OWNER";

// Pesan sengaja sama untuk akun tidak ada, nonaktif, atau secret salah
// agar tidak membuka informasi akun mana yang valid (PRD §21).
const INVALID_MESSAGE: Record<LoginMode, string> = {
  PENGAWAS: "Kode Pengawas atau PIN tidak sesuai.",
  OWNER: "Email/Username atau password tidak sesuai.",
};

function lockedMessage(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  return `Terlalu banyak percobaan masuk. Coba lagi dalam ${minutes} menit.`;
}

export async function login(formData: FormData) {
  return runAction("login", async () => {
    const mode: LoginMode = formData.get("mode") === "OWNER" ? "OWNER" : "PENGAWAS";
    const { ip, userAgent } = await getRequestMeta();

    let identifier: string;
    let secret: string;
    if (mode === "OWNER") {
      const data = parseForm(ownerLoginSchema, formData);
      identifier = data.identifier;
      secret = data.password;
    } else {
      const data = parseForm(pengawasLoginSchema, formData);
      identifier = data.kodePengawas;
      secret = data.pin;
    }

    const keys = loginKeys(`${mode}:${identifier}`, ip);
    const locked = await loginLockRemaining(keys);
    if (locked > 0) {
      await audit({ action: "LOGIN_LOCKED", result: "FAILURE", detail: { mode, identifier, ip } });
      throw new AppError("AUTHENTICATION", { userMessage: lockedMessage(locked) });
    }

    const user =
      mode === "OWNER"
        ? await db.user.findFirst({
            where: {
              role: "SUPER_ADMIN",
              ...(identifier.includes("@") ? { email: identifier } : { username: identifier }),
            },
          })
        : await db.user.findFirst({ where: { role: "PENGAWAS", kodePengawas: identifier } });

    const storedHash = mode === "OWNER" ? user?.passwordHash : user?.pinHash;
    let valid = false;
    if (storedHash) valid = await verifySecret(secret, storedHash);
    else await burnVerifyTime(secret);

    if (!user || !valid || !user.isActive) {
      await recordLoginFailure(keys);
      await audit({
        action: "LOGIN_FAILED",
        result: "FAILURE",
        userId: user?.id,
        detail: { mode, identifier, ip, reason: !user ? "not_found" : !valid ? "bad_secret" : "inactive" },
      });
      throw new AppError("AUTHENTICATION", { userMessage: INVALID_MESSAGE[mode] });
    }

    await clearLoginFailures(`${mode}:${identifier}`);
    await createSession(user, userAgent);
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await audit({ action: "LOGIN_SUCCESS", result: "SUCCESS", userId: user.id, detail: { mode, ip } });

    return { redirectTo: "/" };
  });
}

export async function logout() {
  return runAction("logout", async () => {
    const user = await getCurrentUser();
    await destroySession();
    if (user) await audit({ action: "LOGOUT", result: "SUCCESS", userId: user.id });
    return { redirectTo: "/login" };
  });
}
