import { Files, LayoutDashboard, UsersRound } from "lucide-react";

import { type SidebarData } from "./types";

export const clientSidebarData: SidebarData = {
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
          title: "Estado del proyecto",
          url: "/project-status",
          icon: UsersRound,
        },
        {
          title: "Registros médicos",
          url: "/registers-medical",
          icon: Files,
        },
      ],
    },
  ],
};
