import React from "react";

interface LenderDashboardSkeletonProps {
  className?: string;
}

export function LenderDashboardSkeleton({ className = "" }: LenderDashboardSkeletonProps) {
  return (
    <div className={`container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-6xl ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="h-8 bg-neutral-800 rounded w-48 animate-pulse"></div>
        
        {/* Investment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="h-4 bg-neutral-800 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-6 bg-neutral-700 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-neutral-700 rounded w-16 mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Portfolio Overview */}
        <div className="card p-6">
          <div className="h-5 bg-neutral-800 rounded w-40 mb-4 animate-pulse"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-neutral-700 rounded">
                <div className="w-12 h-12 bg-neutral-800 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-neutral-700 rounded w-24 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-neutral-700 rounded w-16 animate-pulse"></div>
                </div>
                <div className="h-8 bg-neutral-700 rounded w-20 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="card p-6">
          <div className="h-5 bg-neutral-800 rounded w-36 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-neutral-700 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-neutral-700 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 bg-neutral-800 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-neutral-700 rounded w-12 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}