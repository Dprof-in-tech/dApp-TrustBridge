import React from "react";

interface FormSkeletonProps {
  className?: string;
  fields?: number;
  showButtons?: boolean;
}

export function FormSkeleton({ 
  className = "",
  fields = 4,
  showButtons = true 
}: FormSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Form Fields */}
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-neutral-700 rounded w-full animate-pulse"></div>
        </div>
      ))}
      
      {/* Form Buttons */}
      {showButtons && (
        <div className="flex space-x-3 pt-4">
          <div className="h-10 bg-neutral-700 rounded w-20 animate-pulse"></div>
          <div className="h-10 bg-neutral-800 rounded w-24 animate-pulse"></div>
        </div>
      )}
    </div>
  );
}

interface ModalSkeletonProps {
  className?: string;
  title?: boolean;
  content?: "form" | "list" | "details";
}

export function ModalSkeleton({ 
  className = "",
  title = true,
  content = "form"
}: ModalSkeletonProps) {
  return (
    <div className={`p-6 ${className}`}>
      {/* Modal Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-6 bg-neutral-800 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-neutral-700 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-6 w-6 bg-neutral-700 rounded animate-pulse"></div>
        </div>
      )}

      {/* Modal Content */}
      {content === "form" && <FormSkeleton />}
      
      {content === "list" && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border border-neutral-700 rounded">
              <div className="w-8 h-8 bg-neutral-800 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-neutral-800 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-neutral-700 rounded w-24 animate-pulse"></div>
              </div>
              <div className="h-8 bg-neutral-700 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      )}

      {content === "details" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-800 rounded w-20 animate-pulse"></div>
              <div className="h-6 bg-neutral-700 rounded w-32 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-800 rounded w-24 animate-pulse"></div>
              <div className="h-6 bg-neutral-700 rounded w-28 animate-pulse"></div>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-4">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}