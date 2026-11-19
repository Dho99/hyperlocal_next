import { prisma } from "@/lib/prisma";

export const DEFAULT_EXIF_VALIDATION_ENABLED = true;

/**
 * Read the persisted global EXIF-validation switch.
 * Falling back to enabled preserves the existing validation behavior during
 * migration rollout or if the settings table is temporarily unavailable.
 */
export async function getExifValidationEnabled(): Promise<boolean> {
    try {
        const config = await prisma.photoValidationConfig.findUnique({
            where: { id: "default" },
            select: { isExifValidationEnabled: true },
        });
        return config?.isExifValidationEnabled ?? DEFAULT_EXIF_VALIDATION_ENABLED;
    } catch {
        return DEFAULT_EXIF_VALIDATION_ENABLED;
    }
}

export async function setExifValidationEnabled(
    isExifValidationEnabled: boolean,
    updatedBy: string,
) {
    return prisma.photoValidationConfig.upsert({
        where: { id: "default" },
        update: { isExifValidationEnabled, updatedBy },
        create: { id: "default", isExifValidationEnabled, updatedBy },
    });
}
