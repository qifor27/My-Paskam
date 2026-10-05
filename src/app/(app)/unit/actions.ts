"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { parseForm, runAction } from "@/lib/action";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

const name = z
  .string()
  .trim()
  .min(1, "Nama unit wajib diisi")
  .max(40, "Maksimal 40 karakter")
  .transform((v) => v.replace(/\s+/g, " ").toUpperCase());

const NAME_TAKEN = new AppError("VALIDATION", { fieldErrors: { name: "Nama unit sudah dipakai" } });
const isUnique = (e: unknown) => e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";

export async function createUnit(formData: FormData) {
  return runAction("unit.create", async () => {
    const owner = await requirePermission("unit:manage");
    const data = parseForm(z.object({ id: z.uuid(), name }), formData);
    const existing = await db.unit.findUnique({ where: { id: data.id } });
    if (existing) return { id: existing.id }; // idempoten (ADR-004)

    const last = await db.unit.aggregate({ _max: { sortOrder: true } });
    try {
      await db.unit.create({ data: { id: data.id, name: data.name, sortOrder: (last._max.sortOrder ?? 0) + 1 } });
    } catch (e) {
      if (isUnique(e)) throw NAME_TAKEN;
      throw e;
    }
    await audit({ action: "UNIT_CREATED", result: "SUCCESS", userId: owner.id, detail: { unitId: data.id, name: data.name } });
    revalidatePath("/unit");
    return { id: data.id };
  });
}

export async function renameUnit(formData: FormData) {
  return runAction("unit.rename", async () => {
    const owner = await requirePermission("unit:manage");
    const data = parseForm(z.object({ id: z.uuid(), name }), formData);
    const before = await db.unit.findUnique({ where: { id: data.id } });
    if (!before) throw new AppError("VALIDATION", { userMessage: "Unit tidak ditemukan." });
    try {
      await db.unit.update({ where: { id: data.id }, data: { name: data.name } });
    } catch (e) {
      if (isUnique(e)) throw NAME_TAKEN;
      throw e;
    }
    await audit({ action: "UNIT_UPDATED", result: "SUCCESS", userId: owner.id, detail: { unitId: data.id, from: before.name, to: data.name } });
    revalidatePath("/unit");
    return { id: data.id };
  });
}

export async function setUnitActive(formData: FormData) {
  return runAction("unit.setActive", async () => {
    const owner = await requirePermission("unit:manage");
    const { id, active } = parseForm(z.object({ id: z.uuid(), active: z.enum(["true", "false"]) }), formData);
    const isActive = active === "true";
    await db.unit.update({ where: { id }, data: { isActive } });
    await audit({ action: isActive ? "UNIT_ACTIVATED" : "UNIT_DEACTIVATED", result: "SUCCESS", userId: owner.id, detail: { unitId: id } });
    revalidatePath("/unit");
    return { isActive };
  });
}
