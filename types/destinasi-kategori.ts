import { CategoryType } from "@/lib/generated/prisma";

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    type: CategoryType;
}

export interface CategoryFormValues {
    name: string;
    slug: string;
    description?: string;
    type?: CategoryType;
}
