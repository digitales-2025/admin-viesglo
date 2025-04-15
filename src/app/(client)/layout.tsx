"use client";

import { useEffect, useState } from "react";

import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUserTypeGuard(["client"]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, user]);

  if (isLoading || !user || !showContent) {
    return <LoadingTransition show={true} message="Verificando acceso..." />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-indigo-600 text-white p-4">
        <h1 className="text-xl font-bold">Panel de Cliente</h1>
      </header>
      <main className="flex-grow p-4">{children}</main>
    </div>
  );
}
