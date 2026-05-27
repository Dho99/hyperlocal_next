import { ValidationSchema } from "@/lib/validations/halal-validation.schema";
import { Destination } from "./destination";
import { Certification } from "./certification";

export type Validation = ValidationSchema & {
    destination: Destination;
    evidences: ValidationEvidence[];
    certification: Certification | null;
};

export type ValidationEvidence = {
    id: string;
    validationId: string;
    fileUrl: string;
    description?: string;
    createdAt: Date;
};
