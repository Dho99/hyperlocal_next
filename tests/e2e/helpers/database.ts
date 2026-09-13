import { prisma } from "@/lib/prisma";

export async function uniqueEmail(prefix = "e2e") {
  return `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;
}

export async function findVerificationToken(email: string) {
  const row = await prisma.verification.findFirst({
    where: { identifier: { contains: email } },
    orderBy: { createdAt: "desc" },
  });
  return row?.value ?? null;
}

export async function markEmailVerified(email: string) {
  await prisma.user.updateMany({ where: { email }, data: { emailVerified: true } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findFirst({ where: { email } });
}

export async function cleanupUserByEmail(email: string) {
  const u = await prisma.user.findFirst({ where: { email } });
  if (!u) return;
  await prisma.session.deleteMany({ where: { userId: u.id } });
  await prisma.account.deleteMany({ where: { userId: u.id } });
  await prisma.verification.deleteMany({ where: { identifier: { contains: email } } });
  await prisma.user.delete({ where: { id: u.id } });
}

export async function ensureVerifiedUser(email: string, password: string, name = "E2E User") {
  const existing = await prisma.user.findFirst({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { emailVerified: true, role: "user" } });
    return existing;
  }
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error(`seed sign-up failed ${res.status} ${await res.text()}`);
  await markEmailVerified(email);
  return (await prisma.user.findFirst({ where: { email } }))!;
}

export async function ensureAdminUser(email: string, password: string, name = "E2E Admin") {
  const u = await ensureVerifiedUser(email, password, name);
  await prisma.user.update({ where: { id: u.id }, data: { role: "admin" } });
  return prisma.user.findUnique({ where: { id: u.id } });
}
