"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  next: () => void;
  children?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  endComponent?: React.ReactNode;
}

export function InfiniteScroll({
  hasMore,
  isLoading,
  next,
  children,
  loadingComponent,
  endComponent,
}: InfiniteScrollProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          next();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, next]);

  return (
    <>
      {children}
      <div ref={observerTarget} className="h-4 w-full flex justify-center py-4">
        {isLoading && (
          loadingComponent || <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        )}
        {!hasMore && !isLoading && endComponent}
      </div>
    </>
  );
}
