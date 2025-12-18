import type React from "react";

import { Breadcrumbs } from "../ui/breadcrumbs";
import NotificationsBell from "../ui/notifications-bell";
import { Separator } from "../ui/separator";
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

export function Shell({
  children,
  search = true,
  breadcrumbMaxItems: _breadcrumbMaxItems = 4,
  showBreadcrumbIcons: _showBreadcrumbIcons = true,
}: ShellProps) {
  return (
    <>
      <Header fixed>
        <div className="flex items-center w-full gap-4">
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>

          {/* Center Section - Search */}
          {search && (
            <>
              <Separator orientation="vertical" className="hidden lg:block h-6" />
              <div className="hidden lg:flex flex-1 max-w-sm">
                <Search />
              </div>
            </>
          )}

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 ml-auto">
            <NotificationsBell />
            <ThemeSwitch />
            <Separator orientation="vertical" className="h-6" />
            <ProfileDropdown />
          </div>
        </div>
      </Header>

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
