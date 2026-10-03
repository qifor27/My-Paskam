import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Hash password Owner dan PIN Pengawas dengan scrypt (bawaan Node, tanpa
// dependency). Parameter setara rekomendasi OWASP: N=2^15, r=8, p=3 (±32 MB).
// Format: scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>
const PARAMS = { N: 2 ** 15, r: 8, p: 3 } as const;
const KEY_LENGTH = 32;
const MAX_MEM = 64 * 1024 * 1024;

function derive(secret: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(secret.normalize("NFKC"), salt, KEY_LENGTH, { ...opts, maxmem: MAX_MEM }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(secret, salt, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, saltB64, keyB64] = stored.split("$");
  if (algo !== "scrypt" || !n || !r || !p || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await derive(secret, Buffer.from(saltB64, "base64"), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

// Dipakai saat akun tidak ditemukan agar waktu respons tetap sama
// (mencegah enumerasi kode/email lewat timing).
let dummyHash: Promise<string> | undefined;
export async function burnVerifyTime(secret: string): Promise<void> {
  dummyHash ??= hashSecret("dummy-secret-for-timing");
  await verifySecret(secret, await dummyHash);
}
