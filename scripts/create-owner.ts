// Membuat akun Owner (SUPER_ADMIN). Tidak ada registrasi publik (PRD §12),
// jadi akun Owner pertama dibuat lewat CLI ini oleh admin server.
//
//   npm run owner:create
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashSecret } from "../src/lib/auth/password";
import { ownerCreateSchema } from "../src/lib/auth/validation";

try {
  process.loadEnvFile();
} catch {}

let muted = false;
const output = new Writable({
  write(chunk, _enc, done) {
    if (!muted) process.stdout.write(chunk);
    done();
  },
});
const interactive = process.stdin.isTTY === true;
const rl = createInterface({ input: process.stdin, output, terminal: interactive });
// Iterator baris: aman untuk terminal maupun input lewat pipe.
const lines = rl[Symbol.asyncIterator]();

async function ask(question: string, hidden = false) {
  process.stdout.write(question);
  muted = hidden && interactive;
  const { value } = await lines.next();
  muted = false;
  if (hidden || !interactive) process.stdout.write("\n");
  return String(value ?? "");
}

async function main() {
  const name = await ask("Nama Owner: ");
  const email = await ask("Email: ");
  const username = await ask("Username: ");
  const password = await ask("Password: ", true);
  const confirm = await ask("Ulangi password: ", true);
  rl.close();

  if (password !== confirm) throw new Error("Password tidak sama.");
  const parsed = ownerCreateSchema.safeParse({ name, email, username, password });
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `- ${i.message}`).join("\n"));
  }

  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const data = parsed.data;
    const clash = await db.user.findFirst({
      where: { OR: [{ email: data.email }, { username: data.username }] },
    });
    if (clash) throw new Error("Email atau username sudah dipakai.");

    await db.user.create({
      data: {
        id: randomUUID(),
        role: "SUPER_ADMIN",
        name: data.name,
        email: data.email,
        username: data.username,
        passwordHash: await hashSecret(data.password),
      },
    });
    console.log(`Akun Owner "${data.username}" berhasil dibuat.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
