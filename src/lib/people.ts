import type { Role } from "@/generated/prisma/enums";

/** Nama pencatat untuk tampilan; data yang dicatat Owner diberi tanda (ADR-021). */
export function recorderName(user: { name: string; role: Role }): string {
  return user.role === "SUPER_ADMIN" ? `${user.name} (Owner)` : user.name;
}
