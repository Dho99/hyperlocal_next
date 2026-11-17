import { prisma } from "@/lib/prisma";
import type { Prisma, ReportTargetType } from "@/lib/generated/prisma";
import { CreateReportInput, UpdateReportStatusInput } from "@/lib/validations/report.schema";
import {
  withCursorPagination,
  CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";

export interface ReportTargetInfo {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  /** Destination name for UMKM/accommodation targets. */
  parentName: string | null;
}

interface ReportTargetRef {
  targetId: string;
  targetType: ReportTargetType;
}

function targetKey(type: ReportTargetType, ref: string) {
  return `${type}:${ref}`;
}

/**
 * Reports store a loose target reference (no foreign key), so targets can be
 * deleted or have their slug changed after the report was created. Resolve
 * both the current id and the stored reference in one batch per type.
 */
async function resolveReportTargets(reports: ReportTargetRef[]) {
  const resolved = new Map<string, ReportTargetInfo>();
  const refsByType = new Map<ReportTargetType, Set<string>>();

  for (const report of reports) {
    const refs = refsByType.get(report.targetType) ?? new Set<string>();
    refs.add(report.targetId);
    refsByType.set(report.targetType, refs);
  }

  const destinationRefs = [...(refsByType.get("DESTINATION") ?? [])];
  if (destinationRefs.length > 0) {
    const rows = await prisma.destination.findMany({
      where: {
        OR: [
          { id: { in: destinationRefs } },
          { slug: { in: destinationRefs } },
        ],
      },
      select: { id: true, name: true, slug: true, address: true },
    });
    for (const row of rows) {
      const info: ReportTargetInfo = { ...row, parentName: null };
      resolved.set(targetKey("DESTINATION", row.id), info);
      resolved.set(targetKey("DESTINATION", row.slug), info);
    }
  }

  const umkmRefs = [...(refsByType.get("UMKM") ?? [])];
  if (umkmRefs.length > 0) {
    const rows = await prisma.umkm.findMany({
      where: {
        OR: [{ id: { in: umkmRefs } }, { slug: { in: umkmRefs } }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        destination: { select: { name: true } },
      },
    });
    for (const row of rows) {
      const { destination, ...rest } = row;
      const info: ReportTargetInfo = {
        ...rest,
        parentName: destination?.name ?? null,
      };
      resolved.set(targetKey("UMKM", row.id), info);
      resolved.set(targetKey("UMKM", row.slug), info);
    }
  }

  const accommodationRefs = [
    ...(refsByType.get("ACCOMMODATION") ?? []),
  ];
  if (accommodationRefs.length > 0) {
    const rows = await prisma.accommodation.findMany({
      where: {
        OR: [
          { id: { in: accommodationRefs } },
          { slug: { in: accommodationRefs } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        city: true,
        province: true,
      },
    });
    for (const row of rows) {
      const location =
        [row.address, row.city, row.province].filter(Boolean).join(", ") ||
        null;
      const info: ReportTargetInfo = {
        id: row.id,
        name: row.name,
        slug: row.slug,
        address: location,
        parentName: null,
      };
      resolved.set(targetKey("ACCOMMODATION", row.id), info);
      resolved.set(targetKey("ACCOMMODATION", row.slug), info);
    }
  }

  return resolved;
}

function attachTargets<T extends ReportTargetRef>(
  reports: T[],
  targets: Map<string, ReportTargetInfo>,
) {
  return reports.map((report) => ({
    ...report,
    target:
      targets.get(targetKey(report.targetType, report.targetId)) ?? null,
  }));
}

export async function createReport(userId: string | undefined, data: CreateReportInput) {
  return await prisma.report.create({
    data: {
      reporterId: userId,
      targetId: data.targetId,
      targetType: data.targetType,
      reason: data.reason,
      description: data.description,
    },
  });
}

export async function getReports() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return attachTargets(reports, await resolveReportTargets(reports));
}

export async function getPaginatedReports(
  params: CursorPaginationParams,
) {
  const result = await withCursorPagination(
    (take, cursor, skip) =>
      prisma.report.findMany({
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          reporter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    params,
    "Reports fetched successfully",
  );

  return {
    ...result,
    data: attachTargets(
      result.data,
      await resolveReportTargets(result.data),
    ),
  };
}

export async function updateReportStatus(id: string, data: UpdateReportStatusInput) {
  return await prisma.report.update({
    where: { id },
    data: {
      status: data.status,
      adminNotes: data.adminNotes,
    },
  });
}

export async function getReportById(id: string) {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  if (!report) return null;
  const [withTarget] = attachTargets(
    [report],
    await resolveReportTargets([report]),
  );
  return withTarget;
}

export async function deleteReport(id: string) {
  return await prisma.report.delete({ where: { id } });
}

/**
 * Removes reports pointing at a target that is about to be deleted. Reports
 * have no foreign key, so without this cleanup they would keep showing up in
 * the admin list with a dangling reference.
 */
export async function deleteReportsForTarget(
  tx: Prisma.TransactionClient,
  targetType: ReportTargetType,
  targetRefs: string[],
) {
  const refs = targetRefs.filter(Boolean);
  if (refs.length === 0) return;
  await tx.report.deleteMany({
    where: { targetType, targetId: { in: refs } },
  });
}
