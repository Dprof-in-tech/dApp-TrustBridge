import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  color?: "white" | "primary" | "secondary";
}

export function LoadingSpinner({ 
  size = "md", 
  className = "",
  color = "white"
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-3 h-3 border",
    md: "w-4 h-4 border-2",
    lg: "w-6 h-6 border-2"
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    primary: "border-blue-500 border-t-transparent", 
    secondary: "border-neutral-500 border-t-transparent"
  };

  return (
    <div 
      className={cn(
        "rounded-full animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface ButtonLoadingProps {
  loading?: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  spinnerColor?: "white" | "primary" | "secondary";
}

export function ButtonLoading({ 
  loading = false, 
  children, 
  size = "sm",
  spinnerColor = "white"
}: ButtonLoadingProps) {
  return (
    <>
      {loading && <LoadingSpinner size={size} color={spinnerColor} className="mr-2" />}
      {children}
    </>
  );
}