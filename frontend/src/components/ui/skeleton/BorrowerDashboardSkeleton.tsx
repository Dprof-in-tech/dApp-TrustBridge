import React from "react";

interface BorrowerDashboardSkeletonProps {
  className?: string;
}

export function BorrowerDashboardSkeleton({ className = "" }: BorrowerDashboardSkeletonProps) {
  return (
    <div className={`container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-6xl ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="h-8 bg-neutral-800 rounded w-48 animate-pulse"></div>
        
        {/* Borrowing Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="h-4 bg-neutral-800 rounded w-20 mb-2 animate-pulse"></div>
              <div className="h-6 bg-neutral-700 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-neutral-700 rounded w-16 mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>
        
        {/* Borrowing Opportunities */}
        <div className="card p-6">
          <div className="space-y-4">
            <div className="h-5 bg-neutral-800 rounded w-32 mb-4 animate-pulse"></div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-neutral-700 rounded p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-neutral-700 rounded w-16 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-700 rounded w-48 animate-pulse"></div>
                  <div className="h-3 bg-neutral-700 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <div className="h-8 bg-neutral-700 rounded w-20 animate-pulse"></div>
                  <div className="h-8 bg-neutral-700 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Loans */}
        <div className="card p-6">
          <div className="h-5 bg-neutral-800 rounded w-28 mb-4 animate-pulse"></div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-neutral-700 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-neutral-800 rounded w-20 animate-pulse"></div>
                    <div className="h-3 bg-neutral-700 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 bg-neutral-800 rounded w-16 animate-pulse"></div>
                  <div className="h-3 bg-neutral-700 rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-8 bg-neutral-700 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}