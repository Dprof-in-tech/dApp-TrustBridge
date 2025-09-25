import React from "react";

interface FormSkeletonProps {
  className?: string;
  fields?: number;
  hasSubmitButton?: boolean;
  showTitle?: boolean;
}

export function FormSkeleton({ 
  className = "", 
  fields = 4,
  hasSubmitButton = true,
  showTitle = true
}: FormSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Form Title */}
      {showTitle && (
        <div className="h-6 bg-neutral-800 rounded w-40 animate-pulse mb-6"></div>
      )}
      
      {/* Form Fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      {hasSubmitButton && (
        <div className="pt-4">
          <div className="h-10 bg-neutral-800 rounded w-32 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}