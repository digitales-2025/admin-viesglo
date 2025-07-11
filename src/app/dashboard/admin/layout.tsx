"use client";

import Cookies from "js-cookie";

import { AppSidebar } from "@/shared/components/layout/AppSidebar";
import { Shell } from "@/shared/components/layout/Shell";
import SkipToMain from "@/shared/components/layout/SkipToMain";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { SearchProvider } from "@/shared/context/search-context";
import { ThemeProvider } from "@/shared/context/theme-provider";
import { cn } from "@/shared/lib/utils";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = Cookies.get("sidebar:state") !== "false";

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
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
            <Shell>{children}</Shell>
          </div>
        </SidebarProvider>
      </SearchProvider>
    </ThemeProvider>
  );
}
