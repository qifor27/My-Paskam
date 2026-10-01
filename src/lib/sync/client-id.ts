// ADR-004: ID record dibuat di client sejak data pertama kali diinput,
// dan dipakai sebagai idempotency key. Retry dengan ID yang sama tidak
// boleh menghasilkan record kedua (PRD §24).
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const IDEMPOTENCY_HEADER = "Idempotency-Key";

export function createClientId(): string {
  return crypto.randomUUID();
}

export function isClientId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}
