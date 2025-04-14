"use client";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { AuthResponse } from "@/app/(auth)/sign-in/_types/auth.types";
import { clinicSidebarData } from "@/shared/components/layout/data/clinic-sidebar-data";
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
import { Skeleton } from "../ui/skeleton";

export default function ClinicSidebar() {
  const { data: user, isLoading } = useCurrentUser();
  const { state } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        {state === "expanded" ? <LogoLarge className="h-10" /> : <LogoSmall className="h-6" />}
      </SidebarHeader>
      <SidebarContent>
        {clinicSidebarData.navGroups.map((props) => (
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
