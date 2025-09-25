import React from "react";

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className = "" }: DashboardSkeletonProps) {
  return (
    <div className={`container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-6xl ${className}`}>
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-neutral-800 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-neutral-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Cards Row Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card stat-card p-5">
              <div className="h-4 bg-neutral-800 rounded w-24 mb-3 animate-pulse"></div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline space-x-2">
                  <div className="h-8 bg-neutral-800 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-neutral-700 rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-neutral-800 rounded animate-pulse"></div>
              </div>
              <div className="h-3 bg-neutral-700 rounded w-20 mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Activity Feed Skeleton */}
        <div className="card p-6">
          <div className="h-5 bg-neutral-800 rounded w-40 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 border border-neutral-700 rounded">
                <div className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-neutral-800 rounded w-48 animate-pulse"></div>
                  <div className="h-3 bg-neutral-700 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-3 bg-neutral-700 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Positions Table Skeleton */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 bg-neutral-800 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-neutral-700 rounded w-20 animate-pulse"></div>
          </div>
          
          <div className="overflow-x-auto">
            {/* Table Header */}
            <div className="flex space-x-4 mb-4 pb-2 border-b border-neutral-700">
              {["Activo", "Cantidad", "APY", "Colateral", "Estado", "Acción"].map((_, i) => (
                <div key={i} className="h-4 bg-neutral-800 rounded w-20 animate-pulse"></div>
              ))}
            </div>
            
            {/* Table Rows */}
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4 items-center py-3 border-b border-neutral-700 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-neutral-800 rounded w-12 animate-pulse"></div>
                    <div className="h-3 bg-neutral-700 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-neutral-700 rounded w-16 animate-pulse"></div>
                ))}
                <div className="h-8 bg-neutral-700 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}