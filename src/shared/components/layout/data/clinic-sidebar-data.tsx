import { Files } from "lucide-react";

import LogoSmall from "@/shared/components/icons/LogoSmall";
import { type SidebarData } from "./types";

export const clinicSidebarData: SidebarData = {
  business: {
    name: "Viesglo",
    logo: LogoSmall,
  },
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
