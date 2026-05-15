import { prisma } from "@/lib/prisma";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";

export async function getPaginatedUmkms(
  params: CursorPaginationParams & { categoryId?: string; destinationId?: string; search?: string }
) {
  return withCursorPagination(
    async (take, cursor, skip) => {
      return await prisma.umkm.findMany({
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          ...(params.categoryId && { categoryId: params.categoryId }),
          ...(params.destinationId && { destinationId: params.destinationId }),
          ...(params.search && {
            name: { contains: params.search, mode: "insensitive" },
          }),
        },
        include: {
          category: true,
          destination: true,
          images: true,
          certifications: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    },
    params,
    "UMKMs fetched successfully"
  );
}

export async function getUmkmById(id: string) {
  return await prisma.umkm.findUnique({
    where: { id },
    include: {
      category: true,
      destination: true,
      images: true,
      certifications: true,
    },
  });
}
