import { CategoryType } from "@/lib/generated/prisma";
import { z } from "zod";
import { categorySchema } from "@/lib/validations/category.schema";

export type CategoryFormValues = z.infer<typeof categorySchema>;

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    type: CategoryType;
}
