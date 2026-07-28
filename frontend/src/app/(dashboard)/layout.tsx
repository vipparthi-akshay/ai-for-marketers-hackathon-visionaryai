"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import { useBusinessStore } from "@/stores/businessStore";
import { api } from "@/lib/api";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { organizationId, setUser, setOrganizationId, initialize } = useAuthStore();
  const { businesses, activeBusiness, setBusinesses, setActiveBusiness } = useBusinessStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    loadBusinesses();
  }, [organizationId]);

  const loadBusinesses = async () => {
    try {
      const me = await api.auth.me();
      setUser(me);

      let orgId = organizationId;
      if (!orgId) {
        const stored = localStorage.getItem("organization_id");
        if (stored) {
          orgId = stored;
          setOrganizationId(stored);
        }
      }

      if (!orgId) return;

      const bizList = await api.businesses.list(orgId);
      setBusinesses(bizList || []);

      if (bizList && bizList.length > 0 && !activeBusiness) {
        setActiveBusiness(bizList[0]);
      }
    } catch (err) {
      console.error("Dashboard layout load error:", err);
    }
  };

  // Determine businessId from URL params or store
  let businessId: string | undefined;

  // Check if we're on a business/[id] route
  const businessMatch = pathname.match(/\/business\/([^/]+)/);
  if (businessMatch && businessMatch[1] !== "new") {
    businessId = businessMatch[1];
  } else if (activeBusiness?.id) {
    businessId = activeBusiness.id;
  }

  return (
    <DashboardLayout businessId={businessId}>
      {children}
    </DashboardLayout>
  );
}
