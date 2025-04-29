"use client";

import { RouteGuard } from "@/auth/presentation/guards/RouteGuard";
import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import { Shell } from "@/shared/components/layout/Shell";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthorized } = useUserTypeGuard(["admin"]);

  if (isLoading || !user || isAuthorized === null) {
    return <LoadingTransition show={true} message="Verificando acceso..." />;
  }

  if (!isAuthorized) {
    return <LoadingTransition show={true} message="Redirigiendo..." />;
  }

  return (
    <AdminLayout>
      <RouteGuard allowedUserTypes={["admin"]}>
        <Shell>{children}</Shell>
      </RouteGuard>
    </AdminLayout>
  );
}
