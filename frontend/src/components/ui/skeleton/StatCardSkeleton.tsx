import { Skeleton } from "../skeleton";

interface StatCardSkeletonProps {
  className?: string;
  showIcon?: boolean;
  showSubtitle?: boolean;
}

export function StatCardSkeleton({ 
  className = "",
  showIcon = true,
  showSubtitle = true
}: StatCardSkeletonProps) {
  return (
    <div className={`card stat-card p-5 ${className}`}>
      <Skeleton className="h-4 w-24 mb-2" />
      <div className="flex items-end justify-between">
        <div className="flex items-baseline space-x-2">
          <Skeleton className="h-8 w-32" />
          {showSubtitle && <Skeleton className="h-4 w-12" />}
        </div>
        {showIcon && <Skeleton className="h-8 w-8 rounded" />}
      </div>
    </div>
  );
}