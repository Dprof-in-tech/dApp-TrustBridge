import React from "react";

interface ProfileSkeletonProps {
  className?: string;
}

export function ProfileSkeleton({ className = "" }: ProfileSkeletonProps) {
  return (
    <main className={`container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-3xl ${className}`}>
      {/* Header Skeleton */}
      <div className="space-y-2 mb-8">
        <div className="h-8 bg-neutral-800 rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-neutral-700 rounded w-96 animate-pulse"></div>
      </div>

      {/* Profile Form Card Skeleton */}
      <div className="card p-6 mb-8">
        {/* Card Header */}
        <div className="border-b border-custom pb-3 mb-4">
          <div className="h-6 bg-neutral-800 rounded w-40 animate-pulse"></div>
        </div>
        
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Name Field */}
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
          </div>
          
          {/* Last Name Field */}
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
          </div>
          
          {/* Country Field */}
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-16 animate-pulse"></div>
            <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
          </div>
          
          {/* Phone Field */}
          <div className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
          </div>
        </div>

        {/* Wallet Address Field */}
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-neutral-800 rounded w-28 animate-pulse"></div>
          <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
          <div className="h-3 bg-neutral-700 rounded w-64 animate-pulse"></div>
        </div>

        {/* Submit Button */}
        <div className="h-10 bg-neutral-800 rounded w-32 animate-pulse"></div>
      </div>

      {/* Additional Info Card Skeleton */}
      <div className="card p-6">
        <div className="border-b border-custom pb-3 mb-4">
          <div className="h-6 bg-neutral-800 rounded w-32 animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-neutral-700 rounded animate-pulse mt-0.5"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-neutral-700 rounded animate-pulse mt-0.5"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-neutral-700 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-neutral-700 rounded animate-pulse mt-0.5"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-neutral-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-neutral-700 rounded w-4/5 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}