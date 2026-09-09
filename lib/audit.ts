import { prisma } from "./prisma";
export async function auditLog(opts: { userId?: string | null; action: string; target: string; targetId?: string | null; ip?: string | null; userAgent?: string | null }) {
    try { await prisma.auditLog.create({ data: { userId: opts.userId ?? null, action: opts.action, target: opts.target, targetId: opts.targetId ?? null, ip: opts.ip ?? null, userAgent: opts.userAgent ?? null } }); } catch {}
}
export async function cleanupAuditLogs(retentionDays = Number(process.env.AUDIT_LOG_RETENTION_DAYS ?? 90)) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    return prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
}
