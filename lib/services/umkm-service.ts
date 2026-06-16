import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";
import type { Destination } from "@/types/destination";
import type { HalalCertification, Umkm, UmkmFormValues } from "@/types/umkm";
import type { PublicReview } from "@/types/review";
import { calculateHalalScoreFromWeights } from "@/lib/utils/calculate-halal-score";
import {
    withCursorPagination,
    CursorPaginationParams,
} from "@/lib/pagination/cursorPagination";

const TRIAGE_NOTE =
    "PERLU ATENSI KHUSUS: Skor awal di bawah ambang batas minimal ekosistem.";

async function validateUmkmCategory(
    categoryId: string | null | undefined,
): Promise<void> {
    if (!categoryId) return;
    const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { type: true },
    });
    if (!category) throw new Error("Kategori tidak ditemukan");
    if (category.type !== "UMKM") {
        throw new Error(
            "Kategori yang dipilih bukan kategori UMKM. Pilih kategori dengan tipe UMKM.",
        );
    }
}

function serializeUmkm(raw: unknown): Umkm {
    const umkm = raw as Umkm & {
        latitude: unknown | null;
        longitude: unknown | null;
        destination:
            | (Destination & {
                  latitude: unknown | null;
                  longitude: unknown | null;
              })
            | null;
        certifications?: Array<Record<string, unknown>>;
    };
    return {
        ...umkm,
        latitude: umkm.latitude ? Number(umkm.latitude) : null,
        longitude: umkm.longitude ? Number(umkm.longitude) : null,
        createdAt: umkm.createdAt,
        updatedAt: umkm.updatedAt,
        destination: umkm.destination
            ? {
                  ...umkm.destination,
                  latitude: umkm.destination.latitude
                      ? Number(umkm.destination.latitude)
                      : null,
                  longitude: umkm.destination.longitude
                      ? Number(umkm.destination.longitude)
                      : null,
                  createdAt: umkm.destination.createdAt,
                  updatedAt: umkm.destination.updatedAt,
              }
            : null,
        certifications: umkm.certifications?.map(
            (cert: HalalCertification) => ({
                ...cert,
                issuedAt: cert.issuedAt,
                expiredAt: cert.expiredAt,
                createdAt: cert.createdAt,
                updatedAt: cert.updatedAt,
                validations: cert.validations?.map((val) => ({
                    ...val,
                    validatedAt: val.validatedAt,
                    createdAt: val.createdAt,
                    updatedAt: val.updatedAt,
                })),
            }),
        ),
    };
}

export async function getPaginatedUmkms(
    params: CursorPaginationParams & {
        categoryId?: string;
        categorySlug?: string;
        destinationId?: string;
        search?: string;
        areaId?: string;
        scope?: "admin" | "public";
        validationStatus?: string;
    },
) {
    const validationStatuses = params.validationStatus
        ? params.validationStatus.split(",").filter(Boolean)
        : undefined;
    const scopeOr = params.scope === "public"
        ? [{ coverageAreaId: null }, { coverageArea: { isActive: true } }]
        : undefined;

    return withCursorPagination(
        async (take, cursor, skip) => {
            const andConditions: Prisma.UmkmWhereInput[] = [];

            if (scopeOr) {
                andConditions.push({ OR: scopeOr });
            }

            if (params.search) {
                andConditions.push({
                    OR: [
                        { name: { contains: params.search, mode: "insensitive" } },
                        {
                            destination: {
                                name: { contains: params.search, mode: "insensitive" },
                            },
                        },
                    ],
                });
            }

            const umkms = await prisma.umkm.findMany({
                take,
                skip,
                cursor: cursor ? { id: cursor } : undefined,
                where: {
                    category: { type: "UMKM" },
                    ...(params.categoryId && { categoryId: params.categoryId }),
                    ...(params.categorySlug && params.categorySlug !== "Semua" && {
                        category: { slug: params.categorySlug },
                    }),
                    ...(params.areaId && { coverageAreaId: params.areaId }),
                    ...(params.destinationId && {
                        destinationId: params.destinationId,
                    }),
                    ...(validationStatuses && {
                        validationStatus: { in: validationStatuses },
                    }),
                    ...(andConditions.length > 1 && { AND: andConditions }),
                    ...(andConditions.length === 1 && andConditions[0] as Prisma.UmkmWhereInput),
                },
                include: {
                    category: true,
                    destination: true,
                    images: true,
                    certifications: {
                        include: {
                            validations: true,
                        },
                    },
                },
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            });

            return umkms.map((u) => serializeUmkm(u));
        },
        params,
        "UMKMs fetched successfully",
    );
}

export async function getUmkms(scope?: "admin" | "public") {
    const umkms = await prisma.umkm.findMany({
        where: {
            ...(scope === "public" && {
                OR: [
                    { coverageAreaId: null },
                    { coverageArea: { isActive: true } },
                ],
            }),
        },
        include: {
            category: true,
            destination: true,
            images: true,
            certifications: {
                include: {
                    validations: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return umkms.map((umkm) => serializeUmkm(umkm));
}

export async function getUmkm(id: string, scope?: "admin" | "public") {
    const umkm = await prisma.umkm.findUnique({
        where: {
            id,
            ...(scope === "public" && {
                OR: [
                    { coverageAreaId: null },
                    { coverageArea: { isActive: true } },
                ],
            }),
        },
        include: {
            category: true,
            destination: true,
            images: true,
            certifications: {
                include: {
                    validations: {
                        include: {
                            evidences: true,
                        },
                    },
                },
            },
        },
    });

    return umkm ? serializeUmkm(umkm) : null;
}

export async function createUmkm(
    values: UmkmFormValues,
    facilityIds?: string[],
) {
    const { images, ...data } = values;
    await validateUmkmCategory(data.categoryId);

    let halalScore = 0;
    if (facilityIds && facilityIds.length > 0) {
        const masterFacilities = await prisma.halalFacility.findMany({
            where: { id: { in: facilityIds } },
        });
        const facilityWeights = masterFacilities.map((mf) => ({
            facilityType: mf.facilityType,
            weight: mf.weight ?? 0,
        }));
        halalScore = calculateHalalScoreFromWeights(facilityWeights);
    }

    const umkm = await prisma.umkm.create({
        data: {
            ...data,
            images: images
                ? {
                      create: images.map((img, idx) => ({
                          imageUrl: img.imageUrl,
                          isPrimary: idx === 0,
                          caption: `Foto ${idx + 1}`,
                      })),
                  }
                : undefined,
            ...(facilityIds && facilityIds.length > 0
                ? {
                      umkmHalalFacilities: {
                          create: facilityIds.map((fid) => ({
                              facilityId: fid,
                          })),
                      },
                  }
                : {}),
            ...(halalScore < 50 && facilityIds && facilityIds.length > 0
                ? { surveyorNote: TRIAGE_NOTE }
                : {}),
        },
        include: {
            category: true,
            destination: true,
            images: true,
            umkmHalalFacilities: true,
        },
    });

    return serializeUmkm(umkm);
}

export async function updateUmkm(id: string, values: UmkmFormValues) {
    const { images, ...data } = values;
    await validateUmkmCategory(data.categoryId);

    const umkm = await prisma.$transaction(async (tx) => {
        // Delete old images if new ones are provided
        if (images) {
            await tx.umkmImage.deleteMany({
                where: { umkmId: id },
            });
        }

        return await tx.umkm.update({
            where: { id },
            data: {
                ...data,
                images: images
                    ? {
                          create: images.map((img, idx) => ({
                              imageUrl: img.imageUrl,
                              isPrimary: idx === 0,
                              caption: `Foto ${idx + 1}`,
                          })),
                      }
                    : undefined,
            },
            include: {
                category: true,
                destination: true,
                images: true,
            },
        });
    });

    return serializeUmkm(umkm);
}
export async function deleteUmkm(id: string) {
    return await prisma.umkm.delete({
        where: { id },
    });
}

export interface FacilityInfo {
    id: string;
    name: string;
    instanceName: string | null;
    type: string | null;
}

export interface UmkmDetail extends Umkm {
    reviews: PublicReview[];
    destinationFacilities: FacilityInfo[];
}

export async function getUmkmDetail(idOrSlug: string, scope?: "admin" | "public") {
    const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            idOrSlug,
        );
    const umkm = await prisma.umkm.findFirst({
        where: {
            ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }),
            ...(scope === "public" && {
                OR: [
                    { coverageAreaId: null },
                    { coverageArea: { isActive: true } },
                ],
            }),
        },
        include: {
            category: true,
            destination: {
                include: {
                    destinationHalalFacilities: {
                        include: {
                            facility: true,
                        },
                    },
                },
            },
            images: true,
            certifications: {
                include: {
                    validations: {
                        include: {
                            evidences: true,
                        },
                    },
                },
            },
            reviews: {
                include: {
                    user: {
                        select: { id: true, name: true, image: true },
                    },
                    sentiment: true,
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!umkm) return null;

    const facilities: FacilityInfo[] =
        umkm.destination?.destinationHalalFacilities?.map((dhf) => ({
            id: dhf.facility.id,
            name: dhf.facility.name,
            instanceName: dhf.name,
            type: dhf.facility.facilityType,
        })) || [];

    const reviews: PublicReview[] = umkm.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: { id: r.user.id, name: r.user.name, image: r.user.image },
        sentiment: r.sentiment ? { label: r.sentiment.label } : null,
    }));

    const serialized = serializeUmkm(umkm);

    return {
        ...serialized,
        reviews,
        destinationFacilities: facilities,
    } as UmkmDetail;
}
