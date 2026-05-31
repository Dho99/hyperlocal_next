import { prisma } from "@/lib/prisma";
import { CreateReportInput, UpdateReportStatusInput } from "@/lib/validations/report.schema";

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
  return await prisma.report.findMany({
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
  return await prisma.report.findUnique({
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
}
