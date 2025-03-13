"use client";

import { Box } from "lucide-react";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { AuthResponse } from "@/app/(auth)/sign-in/_types/auth.types";
import { NavGroup } from "@/shared/components/layout/NavGroup";
import { NavUser } from "@/shared/components/layout/NavUser";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/shared/components/ui/sidebar";
import { Skeleton } from "../ui/skeleton";
import { sidebarData } from "./data/sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <Box />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {isLoading ? <Skeleton className="h-10 w-full" /> : <NavUser user={user as AuthResponse} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
