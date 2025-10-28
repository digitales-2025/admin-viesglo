"use client";

import { NavGroup } from "@/shared/components/layout/NavGroup";
import { NavUser } from "@/shared/components/layout/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import LogoLarge from "../icons/LogoLarge";
import LogoSmall from "../icons/LogoSmall";
import { sidebarData } from "./data/sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        {state === "expanded" ? <LogoLarge className="h-10" /> : <LogoSmall className="h-6" />}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
