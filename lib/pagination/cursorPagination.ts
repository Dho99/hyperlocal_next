export interface CursorPaginationParams {
    limit?: number;
    cursor?: string | null;
    status?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message?: string;
    data: T[];
    pagination: {
        limit: number;
        next_cursor: string | null;
        has_more: boolean;
    };
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Generic helper for cursor-based pagination with Prisma.
 * Uses a simple 'id' as the cursor.
 */
export async function withCursorPagination<T extends { id: string }>(
    fetcher: (take: number, cursor?: string, skip?: number) => Promise<T[]>,
    params: CursorPaginationParams,
    message: string = "Data fetched successfully",
): Promise<PaginatedResponse<T>> {
    const limit = Math.min(Number(params.limit) || DEFAULT_LIMIT, MAX_LIMIT);
    const cursor = params.cursor || undefined;

    // Take limit + 1 to check if there are more items
    const take = limit + 1;
    const skip = cursor ? 1 : 0;

    try {
        const results = await fetcher(take, cursor, skip);

        const hasMore = results.length > limit;
        const data = hasMore ? results.slice(0, limit) : results;
        const nextCursor = hasMore ? data[data.length - 1].id : null;

        return {
            success: true,
            message,
            data,
            pagination: {
                limit,
                next_cursor: nextCursor,
                has_more: hasMore,
            },
        };
    } catch (error: unknown) {
        // Handle Prisma "Record not found" error for invalid cursor
        const prismaError = error as { code?: string };
        if (prismaError.code === "P2025" && cursor) {
            console.warn(
                `Cursor pagination fallback: Cursor ${cursor} not found. Returning first page.`,
            );
            return withCursorPagination(
                fetcher,
                { ...params, cursor: undefined },
                message,
            );
        }
        throw error;
    }
}
