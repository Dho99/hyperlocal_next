import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { PaginatedResponse } from "@/lib/pagination/cursorPagination";

interface UseCursorPaginationOptions {
  url: string;
  limit?: number;
  params?: Record<string, string | number | boolean | null | undefined>;
  onSuccess?: (data: unknown[]) => void;
}

export function useCursorPagination<T>({
  url,
  limit = 20,
  params = {},
  onSuccess,
}: UseCursorPaginationOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const paramsKey = useMemo(() => JSON.stringify(params), [params]);

  const fetchData = useCallback(async (cursor?: string | null, isInitial = false) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    await Promise.resolve();
    if (controller.signal.aborted) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<PaginatedResponse<T>>(url, {
        params: {
          ...(JSON.parse(paramsKey) as Record<
            string,
            string | number | boolean | null | undefined
          >),
          limit,
          cursor: cursor || undefined,
        },
        signal: controller.signal,
      });

      if (requestIdRef.current !== requestId) return;

      const result = response.data;
      
      if (result.success) {
        setData((prev) => (isInitial ? result.data : [...prev, ...result.data]));
        setNextCursor(result.pagination.next_cursor);
        setHasMore(result.pagination.has_more);
        
        if (onSuccess && isInitial) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err: unknown) {
      if (axios.isCancel(err) || requestIdRef.current !== requestId) return;

      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(err instanceof Error ? err : new Error(message));
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [url, limit, paramsKey, onSuccess]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData(null, true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchData, paramsKey]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading && nextCursor) {
      fetchData(nextCursor);
    }
  }, [hasMore, isLoading, nextCursor, fetchData]);

  const refresh = useCallback(() => {
    fetchData(null, true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
