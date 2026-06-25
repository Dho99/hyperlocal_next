import { umkmSchema, type UmkmFormValues } from "@/lib/validations/umkm.schema";
import { Category } from "./category";
import { Destination } from "./destination";

export type { UmkmFormValues };
export { umkmSchema };

export type CertificationStatus = "PENDING" | "VALID" | "EXPIRED" | "REVOKED";
export type ValidationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface UmkmImage {
    id: string;
    umkmId: string;
    imageUrl: string;
    caption: string | null;
    isPrimary: boolean;
    createdAt: Date | string;
}

export interface ValidationEvidence {
    id: string;
    validationId: string;
    fileUrl: string;
    description: string | null;
    createdAt: Date | string;
}

export interface HalalValidation {
    id: string;
    certificationId: string;
    validatorId: string | null;
    status: ValidationStatus;
    notes: string | null;
    validatedAt: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    evidences?: ValidationEvidence[];
}

export interface HalalCertification {
    id: string;
    umkmId: string;
    certificateNo: string | null;
    issuer: string | null;
    issuedAt: Date | string | null;
    expiredAt: Date | string | null;
    status: CertificationStatus;
    documentUrl: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    validations?: HalalValidation[];
}

export interface Umkm {
    id: string;
    owner: string;
    coverageAreaId: string | null;
    destinationId: string | null;
    categoryId: string | null;
    name: string;
    slug: string;
    description: string | null;
    address: string | null;
    phone: string | null;
    estimatedCost: number | null;
    latitude: number | null;
    longitude: number | null;
    rating?: number | null;
    reviewCount?: number | null;
    openingHours?: Record<string, { open: string; close: string }> | { open: string; close: string } | null;
    validationStatus?: string;
    surveyorNote?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Relations
    category?: Category | null;
    destination?: Destination | null;
    images?: UmkmImage[];
    certifications?: HalalCertification[];
}

export type CreateUmkmInput = Omit<
    Umkm,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "category"
    | "destination"
    | "images"
    | "certifications"
>;
export type UpdateUmkmInput = Partial<CreateUmkmInput>;
