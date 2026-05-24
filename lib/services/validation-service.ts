import { prisma } from "@/lib/prisma";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";

export async function getPaginatedValidations(
  params: CursorPaginationParams & { status?: string; validatorId?: string }
) {
  return withCursorPagination(
    async (take, cursor, skip) => {
      return await prisma.halalValidation.findMany({
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(params.status && { status: params.status as any }),
          ...(params.validatorId && { validatorId: params.validatorId }),
        },
        include: {
          certification: {
            include: {
              umkm: true,
            }
          },
          validator: true,
          evidences: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    },
    params,
    "Validations fetched successfully"
  );
}
