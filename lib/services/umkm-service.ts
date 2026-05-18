import { prisma } from "@/lib/prisma";
import type { Umkm, UmkmFormValues } from "@/types/umkm";
import { withCursorPagination, CursorPaginationParams } from "@/lib/pagination/cursorPagination";

function serializeUmkm(umkm: any): Umkm {
    return {
        ...umkm,
        latitude: umkm.latitude ? umkm.latitude.toString() : null,
        longitude: umkm.longitude ? umkm.longitude.toString() : null,
        createdAt: umkm.createdAt?.toISOString(),
        updatedAt: umkm.updatedAt?.toISOString(),
        destination: umkm.destination ? {
            ...umkm.destination,
            latitude: umkm.destination.latitude ? umkm.destination.latitude.toString() : null,
            longitude: umkm.destination.longitude ? umkm.destination.longitude.toString() : null,
            createdAt: umkm.destination.createdAt?.toISOString(),
            updatedAt: umkm.destination.updatedAt?.toISOString(),
        } : null,
        certifications: umkm.certifications?.map((cert: any) => ({
            ...cert,
            issuedAt: cert.issuedAt?.toISOString() || null,
            expiredAt: cert.expiredAt?.toISOString() || null,
            createdAt: cert.createdAt?.toISOString(),
            updatedAt: cert.updatedAt?.toISOString(),
            validations: cert.validations?.map((val: any) => ({
                ...val,
                validatedAt: val.validatedAt?.toISOString() || null,
                createdAt: val.createdAt?.toISOString(),
                updatedAt: val.updatedAt?.toISOString(),
            }))
        }))
    };
}

export async function getPaginatedUmkms(
  params: CursorPaginationParams & { categoryId?: string; destinationId?: string; search?: string }
) {
  return withCursorPagination(
    async (take, cursor, skip) => {
      const umkms = await prisma.umkm.findMany({
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
          certifications: {
              include: {
                  validations: true
              }
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });

      return umkms.map(u => serializeUmkm(u));
    },
    params,
    "UMKMs fetched successfully"
  );
}

export async function getUmkms() {
    const umkms = await prisma.umkm.findMany({
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            category: true,
            destination: true,
            images: true,
            certifications: {
                include: {
                    validations: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });

    return umkms.map((umkm) => serializeUmkm(umkm));
}

export async function getUmkm(id: string) {
    const umkm = await prisma.umkm.findUnique({
        where: { id },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            category: true,
            destination: true,
            images: true,
            certifications: {
                include: {
                    validations: {
                        include: {
                            evidences: true
                        }
                    }
                }
            }
        },
    });

    return umkm ? serializeUmkm(umkm) : null;
}

export async function createUmkm(values: UmkmFormValues) {
    const umkm = await prisma.umkm.create({
        data: values as any,
        include: {
            category: true,
            destination: true,
        },
    });

    return serializeUmkm(umkm);
}

export async function updateUmkm(id: string, values: UmkmFormValues) {
    const umkm = await prisma.umkm.update({
        where: { id },
        data: values as any,
        include: {
            category: true,
            destination: true,
        },
    });

    return serializeUmkm(umkm);
}

export async function deleteUmkm(id: string) {
    return await prisma.umkm.delete({
        where: { id },
    });
}
