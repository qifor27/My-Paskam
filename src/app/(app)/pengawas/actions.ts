"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { parseForm, runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { hashSecret } from "@/lib/auth/password";
import { requirePermission, revokeUserSessions } from "@/lib/auth/session";
import { pengawasCreateSchema, pengawasUpdateSchema, pinResetSchema } from "@/lib/auth/validation";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

const KODE_TAKEN = new AppError("VALIDATION", {
  fieldErrors: { kodePengawas: "Kode Pengawas sudah dipakai" },
});

function isUniqueViolation(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function findPengawas(id: string) {
  const user = await db.user.findUnique({ where: { id } });
  // Owner tidak boleh diubah lewat modul ini.
  if (!user || user.role !== "PENGAWAS") {
    throw new AppError("VALIDATION", { userMessage: "Data Pengawas tidak ditemukan." });
  }
  return user;
}

export async function createPengawas(formData: FormData) {
  return runAction("pengawas.create", async () => {
    const owner = await requirePermission("pengawas:manage");
    const data = parseForm(pengawasCreateSchema, formData);

    // Idempoten (ADR-004): retry dengan id yang sama tidak membuat akun kedua.
    const existing = await db.user.findUnique({ where: { id: data.id } });
    if (existing) {
      if (existing.role === "PENGAWAS" && existing.createdById === owner.id) return { id: existing.id };
      throw new AppError("VALIDATION", { detail: "client id collision" });
    }
    if (await db.user.findUnique({ where: { kodePengawas: data.kodePengawas } })) throw KODE_TAKEN;

    try {
      await db.user.create({
        data: {
          id: data.id,
          role: "PENGAWAS",
          name: data.name,
          kodePengawas: data.kodePengawas,
          pinHash: await hashSecret(data.pin),
          createdById: owner.id,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw KODE_TAKEN;
      throw error;
    }

    await audit({
      action: "PENGAWAS_CREATED",
      result: "SUCCESS",
      userId: owner.id,
      detail: { targetId: data.id, kodePengawas: data.kodePengawas },
    });
    revalidatePath("/pengawas");
    return { id: data.id };
  });
}

export async function updatePengawas(formData: FormData) {
  return runAction("pengawas.update", async () => {
    const owner = await requirePermission("pengawas:manage");
    const data = parseForm(pengawasUpdateSchema, formData);
    const before = await findPengawas(data.id);

    const clash = await db.user.findUnique({ where: { kodePengawas: data.kodePengawas } });
    if (clash && clash.id !== data.id) throw KODE_TAKEN;

    try {
      await db.user.update({
        where: { id: data.id },
        data: { name: data.name, kodePengawas: data.kodePengawas },
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw KODE_TAKEN;
      throw error;
    }

    await audit({
      action: "PENGAWAS_UPDATED",
      result: "SUCCESS",
      userId: owner.id,
      detail: {
        targetId: data.id,
        from: { name: before.name, kodePengawas: before.kodePengawas },
        to: { name: data.name, kodePengawas: data.kodePengawas },
      },
    });
    revalidatePath("/pengawas");
    return { id: data.id };
  });
}

const setActiveSchema = z.object({ id: z.uuid(), active: z.enum(["true", "false"]) });

export async function setPengawasActive(formData: FormData) {
  return runAction("pengawas.setActive", async () => {
    const owner = await requirePermission("pengawas:manage");
    const { id, active } = parseForm(setActiveSchema, formData);
    await findPengawas(id);
    const isActive = active === "true";

    await db.user.update({ where: { id }, data: { isActive } });
    // Nonaktif = langsung keluar dari semua perangkat.
    if (!isActive) await revokeUserSessions(id);

    await audit({
      action: isActive ? "PENGAWAS_ACTIVATED" : "PENGAWAS_DEACTIVATED",
      result: "SUCCESS",
      userId: owner.id,
      detail: { targetId: id },
    });
    revalidatePath("/pengawas");
    return { isActive };
  });
}

export async function resetPengawasPin(formData: FormData) {
  return runAction("pengawas.resetPin", async () => {
    const owner = await requirePermission("pengawas:manage");
    const data = parseForm(pinResetSchema, formData);
    await findPengawas(data.id);

    await db.user.update({ where: { id: data.id }, data: { pinHash: await hashSecret(data.pin) } });
    await revokeUserSessions(data.id);

    await audit({
      action: "PENGAWAS_PIN_RESET",
      result: "SUCCESS",
      userId: owner.id,
      detail: { targetId: data.id },
    });
    return { id: data.id };
  });
}
