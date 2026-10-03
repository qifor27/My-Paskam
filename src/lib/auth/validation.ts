import { z } from "zod";

import { AUTH_CONFIG } from "./config";

const pin = z
  .string()
  .regex(new RegExp(`^\\d{${AUTH_CONFIG.pinLength}}$`), `PIN harus ${AUTH_CONFIG.pinLength} digit angka`);

const kodePengawas = z
  .string()
  .trim()
  .toUpperCase()
  .min(1, "Kode Pengawas wajib diisi")
  .regex(/^[A-Z0-9-]{3,20}$/, "Kode Pengawas 3–20 karakter: huruf, angka, atau tanda -");

export const ownerLoginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, "Email / Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const pengawasLoginSchema = z.object({
  kodePengawas: z.string().trim().toUpperCase().min(1, "Kode Pengawas wajib diisi"),
  pin: z.string().min(1, "PIN wajib diisi"),
});

export const pengawasCreateSchema = z
  .object({
    id: z.uuid(),
    name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
    kodePengawas,
    pin,
    pinConfirm: z.string(),
  })
  .refine((d) => d.pin === d.pinConfirm, { path: ["pinConfirm"], message: "Konfirmasi PIN tidak sama" });

export const pengawasUpdateSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, "Nama wajib diisi").max(100, "Nama maksimal 100 karakter"),
  kodePengawas,
});

export const pinResetSchema = z
  .object({ id: z.uuid(), pin, pinConfirm: z.string() })
  .refine((d) => d.pin === d.pinConfirm, { path: ["pinConfirm"], message: "Konfirmasi PIN tidak sama" });

export const ownerCreateSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  email: z.email("Email tidak valid").trim().toLowerCase(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9._-]{3,30}$/, "Username 3–30 karakter: huruf kecil, angka, . _ -"),
  password: z.string().min(AUTH_CONFIG.passwordMinLength, `Password minimal ${AUTH_CONFIG.passwordMinLength} karakter`),
});
