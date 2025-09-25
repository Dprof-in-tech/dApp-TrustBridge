import { Skeleton } from "../skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableSkeleton({ 
  rows = 3, 
  columns = 4,
  showHeader = true,
  className = "" 
}: TableSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Header Skeleton */}
      {showHeader && (
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
        </div>
      )}

      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4 items-center">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          {Array.from({ length: columns - 1 }).map((_, colIndex) => (
            <Skeleton 
              key={`row-${rowIndex}-col-${colIndex}`} 
              className="h-4 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}