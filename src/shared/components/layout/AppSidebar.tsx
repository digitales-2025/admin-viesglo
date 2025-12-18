"use client";

import { BusinessName } from "@/shared/components/layout/BusinessName";
import { NavGroup } from "@/shared/components/layout/NavGroup";
import { NavUser } from "@/shared/components/layout/NavUser";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/shared/components/ui/sidebar";
import { sidebarData } from "./data/sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <BusinessName businessData={sidebarData.business} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => {
          // NavGroup maneja internamente el filtrado y retorna null si no hay items visibles
          return <NavGroup key={props.title} {...props} />;
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
