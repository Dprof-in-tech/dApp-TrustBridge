"use client";

import LenderPoolPage from "@/components/modules/marketplace/ui/pages/LenderPoolPage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRoleContext } from "@/providers/role.provider";
import { LenderDashboardSkeleton } from "@/components/ui/skeleton/LenderDashboardSkeleton";


export default function LenderMarketplace() {
  const { role } = useRoleContext();
  const router = useRouter();

  useEffect(() => {
    // If no role is set, redirect to marketplace entry
    if (!role) {
      router.push("/dashboard/marketplace");
    } else if (role !== "lender") {
      // If role is set but not lender, redirect to correct role page
      router.push(`/dashboard/marketplace/${role}`);
    }
  }, [role, router]);

  // Show loading while checking role
  if (!role) {
    return <LenderDashboardSkeleton />;
  }

  // Show loading while redirecting
  if (role !== "lender") {
    return <LenderDashboardSkeleton />;
  }


  return <LenderPoolPage />;

}

