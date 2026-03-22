"use client";

import * as React from "react";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
  /**
   * If true, adds `role="status"` + `aria-busy="true"` to better convey loading state.
   * Keep this off when you already have a parent region announcing loading.
   */
  accessible?: boolean;
};

function cn(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Generic skeleton block for loading states.
 *
 * Usage:
 * - <Skeleton className="h-4 w-32" />
 * - <Skeleton className="h-24 w-full rounded-xl" />
 */
export default function Skeleton({
  className,
  accessible = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      {...props}
      {...(accessible
        ? { role: "status", "aria-busy": true as const }
        : undefined)}
      className={cn(
        "animate-pulse rounded bg-neutral-900/70 border border-neutral-800",
        className
      )}
    />
  );
}
