"use client";

import { BusinessName } from "@/shared/components/layout/BusinessName";
import { clinicSidebarData } from "@/shared/components/layout/data/clinic-sidebar-data";
import { NavGroup } from "@/shared/components/layout/NavGroup";
import { NavUser } from "@/shared/components/layout/NavUser";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/shared/components/ui/sidebar";

export default function ClinicSidebar() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <BusinessName businessData={clinicSidebarData.business} />
      </SidebarHeader>
      <SidebarContent>
        {clinicSidebarData.navGroups.map((props) => {
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
