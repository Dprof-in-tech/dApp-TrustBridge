import React from "react";

interface MarketplaceSkeletonProps {
  className?: string;
}

export function MarketplaceSkeleton({ className = "" }: MarketplaceSkeletonProps) {
  return (
    <main className={`container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-6xl ${className}`}>
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-neutral-800 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-neutral-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card stat-card p-5">
              <div className="h-4 bg-neutral-800 rounded w-24 mb-2 animate-pulse"></div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline space-x-2">
                  <div className="h-8 bg-neutral-800 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-neutral-700 rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-neutral-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pool Table Skeleton */}
        <div className="card pool-card overflow-hidden">
          <div className="p-4 bg-dark-tertiary">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 bg-neutral-800 rounded w-48 animate-pulse"></div>
                <div className="h-3 bg-neutral-700 rounded w-64 animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-neutral-800 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-neutral-800 rounded w-28 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-5">
            {/* Tab skeleton */}
            <div className="flex mb-4 space-x-4">
              <div className="h-8 bg-neutral-800 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-neutral-700 rounded w-20 animate-pulse"></div>
              <div className="h-8 bg-neutral-700 rounded w-16 animate-pulse"></div>
            </div>
            
            {/* Table Header */}
            <div className="flex space-x-4 mb-4">
              {["Asset", "Supplied", "Borrowed", "Supply APY", "Borrow APY", "Role"].map((_, i) => (
                <div key={i} className="h-4 bg-neutral-800 rounded flex-1 animate-pulse"></div>
              ))}
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4 items-center mb-4">
                <div className="h-8 w-8 bg-neutral-800 rounded-full animate-pulse"></div>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-neutral-700 rounded flex-1 animate-pulse"></div>
                ))}
              </div>
            ))}

            {/* Actions Section Skeleton */}
            <div className="mt-6 border-t border-custom pt-6">
              <div className="h-10 bg-neutral-800 rounded w-full mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-neutral-700 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}