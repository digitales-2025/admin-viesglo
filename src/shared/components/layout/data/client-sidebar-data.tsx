import { Files, UsersRound } from "lucide-react";

import { type SidebarData } from "./types";

export const clientSidebarData: SidebarData = {
  navGroups: [
    {
      title: "Inicio",
      items: [
        {
          title: "Estado del proyecto",
          url: "/dashboard/client/project-status",
          icon: UsersRound,
        },
        {
          title: "Registros médicos",
          url: "/dashboard/client/client-medical-records",
          icon: Files,
        },
      ],
    },
  ],
};
