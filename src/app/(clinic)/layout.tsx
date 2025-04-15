"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";
import ClinicSidebar from "@/shared/components/layout/ClinicSidebar";
import SkipToMain from "@/shared/components/layout/SkipToMain";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { SearchProvider } from "@/shared/context/search-context";
import { ThemeProvider } from "@/shared/context/theme-provider";
import { cn } from "@/shared/lib/utils";

export default function ClinicDashboardLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";
  const { user, isLoading } = useUserTypeGuard(["clinic"]);
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <ClinicSidebar />
          <div
            id="content"
            className={cn(
              "ml-auto w-full max-w-full",
              "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
              "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
              "transition-[width] duration-200 ease-linear",
              "flex h-svh flex-col",
              "group-data-[scroll-locked=1]/body:h-full",
              "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh"
            )}
          >
            {children}
          </div>
        </SidebarProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
