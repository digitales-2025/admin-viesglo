"use client";

import Cookies from "js-cookie";

import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";
import ClientSidebar from "@/shared/components/layout/ClientSidebar";
import SkipToMain from "@/shared/components/layout/SkipToMain";
import { LoadingTransition } from "@/shared/components/ui/loading-transition";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { SearchProvider } from "@/shared/context/search-context";
import { ThemeProvider } from "@/shared/context/theme-provider";
import { cn } from "@/shared/lib/utils";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";
  const { user, isLoading, isAuthorized } = useUserTypeGuard(["client"]);

  if (isLoading || !user || isAuthorized === null) {
    return <LoadingTransition show={true} message="Verificando acceso..." />;
  }

  if (!isAuthorized) {
    return <LoadingTransition show={true} message="Redirigiendo..." />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <ClientSidebar />
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
