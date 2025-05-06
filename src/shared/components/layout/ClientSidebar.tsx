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
import { clientSidebarData } from "./data/client-sidebar-data";

export default function ClientSidebar() {
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        {state === "expanded" ? <LogoLarge className="h-10" /> : <LogoSmall className="h-6" />}
      </SidebarHeader>
      <SidebarContent>
        {clientSidebarData.navGroups.map((props) => (
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
