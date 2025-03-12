"use client";

import { Box } from "lucide-react";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { NavGroup } from "@/shared/components/layout/NavGroup";
import { NavUser } from "@/shared/components/layout/NavUser";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/shared/components/ui/sidebar";
import { LoadingTransition } from "../ui/loading-transition";
import { sidebarData } from "./data/sidebar-data";
import { User } from "./data/types";

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
        {isLoading ? <LoadingTransition show={isLoading} /> : <NavUser user={user as User} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
