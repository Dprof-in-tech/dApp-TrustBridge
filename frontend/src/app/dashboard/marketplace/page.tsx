"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelectionModal from "@/components/modules/marketplace/ui/components/RoleSelectionModal";
import { useRoleContext } from "@/providers/role.provider";


export default function MarketplaceEntry() {
  const { role, setRole } = useRoleContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  const router = useRouter();

  // Show modal only once when component mounts
  useEffect(() => {
    if (!hasShownModal) {
      setModalOpen(true);
      setHasShownModal(true);
    }
  }, [hasShownModal]);

  // Get the last selected role from localStorage as fallback

  const getLastSelectedRole = (): "borrower" | "lender" => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem("user-role") as
        | "borrower"
        | "lender"

        | null;
      return savedRole && (savedRole === "lender" || savedRole === "borrower")
        ? savedRole
        : "lender";
    }
    return "lender";
  };

  const handleRoleSelect = (selectedRole: "lender" | "borrower") => {
    setRole(selectedRole);
    setModalOpen(false);
    router.push(`/dashboard/marketplace/${selectedRole}`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);

    // If user closes modal without selecting, redirect to borrower by default
    if (!role) {
      setRole("borrower");
      router.push("/dashboard/marketplace/borrower");

    } else {
      router.push(`/dashboard/marketplace/${role}`);
    }
  };

  return (
    <main className="container mx-auto px-4 md:px-6 pt-24 pb-16 max-w-6xl">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-neutral-800 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-neutral-700 rounded w-96 animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card stat-card p-5">
              <div className="h-4 bg-neutral-800 rounded w-24 mb-2 animate-pulse"></div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline space-x-2">
                  <div className="h-8 bg-neutral-800 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-neutral-700 rounded w-12 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-neutral-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Pool Table Skeleton */}
        <div className="card pool-card overflow-hidden">
          <div className="p-4 bg-dark-tertiary">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-5 bg-neutral-800 rounded w-48 animate-pulse"></div>
                <div className="h-3 bg-neutral-700 rounded w-64 animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-neutral-800 rounded w-24 animate-pulse"></div>
                <div className="h-6 bg-neutral-800 rounded w-28 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="p-5">
            {/* Table Header */}
            <div className="flex space-x-4 mb-4">
              {["Asset", "Supplied", "Borrowed", "Supply APY", "Borrow APY", "Role"].map((_, i) => (
                <div key={i} className="h-4 bg-neutral-800 rounded flex-1 animate-pulse"></div>
              ))}
            </div>
            {/* Table Rows */}
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex space-x-4 items-center mb-4">
                <div className="h-8 w-8 bg-neutral-800 rounded-full animate-pulse"></div>
                {Array.from({ length: 5 }).map((_, colIndex) => (
                  <div key={colIndex} className="h-4 bg-neutral-700 rounded flex-1 animate-pulse"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <RoleSelectionModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onRoleSelect={handleRoleSelect}
        currentRole={getLastSelectedRole()}
      />
    </main>
  );
}
