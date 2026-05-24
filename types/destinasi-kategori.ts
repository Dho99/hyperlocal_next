export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
}

export interface CategoryFormValues {
    name: string;
    slug: string;
    description?: string;
}
