import { Umkm } from "./umkm";
import { ValidationSchema } from "@/lib/validations/halal-validation.schema";

export type Certification = {
    id: string;
    umkmId: string;
    certificateNo?: string | null;
    issuer?: string | null;
    issuedAt?: Date | null;
    expiredAt?: Date | null;
    status: CertificationStatus;
    documentUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    notes?: string | null;
    umkm?: Umkm;
    validations?: ValidationSchema[];
};

export type CertificationStatus = "PENDING" | "APPROVED" | "REJECTED";
