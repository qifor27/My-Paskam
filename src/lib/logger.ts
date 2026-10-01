// Logger terstruktur (JSON per baris). PRD §26: credential tidak boleh masuk log.
const SENSITIVE_WORDS = new Set([
  "password",
  "passwd",
  "pass",
  "pin",
  "token",
  "secret",
  "authorization",
  "cookie",
  "credential",
  "credentials",
  "session",
]);
const REDACTED = "[REDACTED]";

type Level = "info" | "warn" | "error";

/** "newPin" -> ["new", "pin"], "access_token" -> ["access", "token"]. */
function isSensitiveKey(key: string): boolean {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .some((word) => SENSITIVE_WORDS.has(word));
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([key, v]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redact(v, depth + 1),
    ]),
  );
}

function write(level: Level, event: string, data?: Record<string, unknown>) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(data && (redact(data) as Record<string, unknown>)),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => write("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => write("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => write("error", event, data),
};
