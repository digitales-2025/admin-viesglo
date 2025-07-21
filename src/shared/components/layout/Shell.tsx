import type React from "react";

import { Separator } from "../ui/separator";
import { AutoBreadcrumb } from "./AutoBreadcrumb";
import { Header } from "./Header";
import { Main } from "./Main";
import { ProfileDropdown } from "./ProfileDropdown";
import { Search } from "./Search";
import { ThemeSwitch } from "./ThemeSwitch";

interface ShellProps {
  children: React.ReactNode;
  search?: boolean;
  breadcrumbMaxItems?: number;
  showBreadcrumbIcons?: boolean;
}

export function Shell({ children, search = true, breadcrumbMaxItems = 4, showBreadcrumbIcons = true }: ShellProps) {
  return (
    <>
      <Header fixed>
        <div className="flex items-center w-full gap-4">
          {/* Left Section - Breadcrumb */}
          <div className="hidden md:flex items-center min-w-0 flex-1">
            <AutoBreadcrumb maxItems={breadcrumbMaxItems} showIcons={showBreadcrumbIcons} className="max-w-md" />
          </div>

          {/* Center Section - Search */}
          {search && (
            <>
              <Separator orientation="vertical" className="hidden md:block h-6" />
              <div className="flex-1 max-w-sm">
                <Search />
              </div>
            </>
          )}

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 ml-auto">
            <ThemeSwitch />
            <Separator orientation="vertical" className="h-6" />
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      {/* Mobile Breadcrumb */}
      <div className="md:hidden sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center px-4">
          <AutoBreadcrumb maxItems={3} showIcons={showBreadcrumbIcons} className="min-w-0 flex-1" />
        </div>
      </div>

      <Main>{children}</Main>
    </>
  );
}

export function ShellHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      {children}
    </div>
  );
}

export function ShellTitle({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="space-y-1">
      {title && <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>}
      {description && <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>}
    </div>
  );
}
