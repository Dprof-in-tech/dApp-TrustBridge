import React from "react";
import { Skeleton } from "../skeleton";

interface PoolTableSkeletonProps {
  rows?: number;
  className?: string;
}

export function PoolTableSkeleton({ 
  rows = 3,
  className = "" 
}: PoolTableSkeletonProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="custom-table">
        <thead>
          <tr>
            <th>
              <Skeleton className="h-4 w-16" />
            </th>
            <th>
              <Skeleton className="h-4 w-20" />
            </th>
            <th>
              <Skeleton className="h-4 w-20" />
            </th>
            <th>
              <Skeleton className="h-4 w-20" />
            </th>
            <th>
              <Skeleton className="h-4 w-20" />
            </th>
            <th>
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={`pool-row-${index}`}>
              <td>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full mr-3 flex-shrink-0">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </td>
              <td>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </td>
              <td>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </td>
              <td>
                <Skeleton className="h-4 w-12" />
              </td>
              <td>
                <Skeleton className="h-4 w-12" />
              </td>
              <td>
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}