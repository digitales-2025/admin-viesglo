"use client";

import { BusinessName } from "@/shared/components/layout/BusinessName";
import { NavGroup } from "@/shared/components/layout/NavGroup";
import { NavUser } from "@/shared/components/layout/NavUser";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/shared/components/ui/sidebar";
import { clientSidebarData } from "./data/client-sidebar-data";

export default function ClientSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <BusinessName businessData={clientSidebarData.business} />
      </SidebarHeader>
      <SidebarContent>
        {clientSidebarData.navGroups.map((props) => {
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
