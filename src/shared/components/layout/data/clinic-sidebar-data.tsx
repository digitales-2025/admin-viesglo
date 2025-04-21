import { Files, LayoutDashboard, UsersRound } from "lucide-react";

import { type SidebarData } from "./types";

export const clinicSidebarData: SidebarData = {
  navGroups: [
    {
      title: "Inicio",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
        {
          title: "Pacientes",
          url: "/patients",
          icon: UsersRound,
        },
        {
          title: "Registros",
          url: "/registers",
          icon: Files,
        },
      ],
    },
  ],
};
