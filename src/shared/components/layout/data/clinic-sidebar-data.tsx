import { Files } from "lucide-react";

import { type SidebarData } from "./types";

export const clinicSidebarData: SidebarData = {
  navGroups: [
    {
      title: "Inicio",
      items: [
        {
          title: "Registros",
          url: "/dashboard/clinic/registers",
          icon: Files,
        },
      ],
    },
  ],
};
