"use client";

import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import { Shell } from "@/shared/components/layout/Shell";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  // Proteger este layout solo para usuarios tipo admin
  useUserTypeGuard(["admin"]);

  return (
    <AdminLayout>
      <Shell>{children}</Shell>
    </AdminLayout>
  );
}
