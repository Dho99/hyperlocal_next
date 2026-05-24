import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { PaginatedResponse } from '@/lib/pagination/cursorPagination';

interface UseCursorPaginationOptions {
  url: string;
  limit?: number;
  params?: Record<string, any>;
  onSuccess?: (data: any[]) => void;
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
  
  // Track current params to detect changes and reset
  const prevParamsRef = useRef(JSON.stringify(params));

  const fetchData = useCallback(async (cursor?: string | null, isInitial = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<PaginatedResponse<T>>(url, {
        params: {
          ...params,
          limit,
          cursor: cursor || undefined,
        },
      });

      const result = response.data;
      
      if (result.success) {
        setData((prev) => (isInitial ? result.data : [...prev, ...result.data]));
        setNextCursor(result.pagination.next_cursor);
        setHasMore(result.pagination.has_more);
        
        if (onSuccess && isInitial) {
          onSuccess(result.data);
        }
      } else {
        throw new Error(result.message || 'Failed to fetch data');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'An error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [url, limit, params, onSuccess]);

  // Initial fetch or reset on param changes
  useEffect(() => {
    const currentParamsJson = JSON.stringify(params);
    if (prevParamsRef.current !== currentParamsJson) {
      prevParamsRef.current = currentParamsJson;
      fetchData(null, true);
    }
  }, [params, fetchData]);

  // Trigger first load
  useEffect(() => {
    fetchData(null, true);
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
