import {
  Banknote,
  BriefcaseBusiness,
  Building,
  Files,
  GraduationCap,
  Hospital,
  KeyRound,
  Layers,
  LayoutDashboard,
  Lock,
  Settings,
  SquareActivity,
  UserRound,
  UsersRound,
} from "lucide-react";

import { type SidebarData } from "./types";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Inicio",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Gestión Operativa",
      items: [
        {
          title: "Seguimiento",
          icon: Layers,
          url: "/tracking",
        },
        {
          title: "Salud Ocupacional",
          icon: SquareActivity,
          url: "/medical-records",
        },
      ],
    },
    {
      title: "Gestión Administrativa",
      items: [
        {
          title: "Clínicas",
          icon: Hospital,
          url: "/clinics",
        },
        {
          title: "Clientes",
          icon: Building,
          url: "/clients",
        },
        {
          title: "Servicios",
          icon: BriefcaseBusiness,
          url: "/services",
        },
      ],
    },
    {
      title: "Gestión Comercial",
      items: [
        {
          title: "Cotizaciones",
          icon: Files,
          url: "/quotation",
        },
        {
          title: "Pagos",
          icon: Banknote,
          url: "/payment",
        },
      ],
    },
    {
      title: "Gestión de Capacitaciones",
      items: [
        {
          title: "Certificados",
          icon: GraduationCap,
          url: "/certificates",
        },
      ],
    },
    {
      title: "Gestión de Usuarios",
      items: [
        {
          title: "Usuarios y permisos",
          icon: UsersRound,
          items: [
            {
              title: "Usuarios",
              icon: UsersRound,
              url: "/users",
            },
            {
              title: "Roles y permisos",
              icon: KeyRound,
              url: "/roles",
            },
          ],
        },
        {
          title: "Configuración",
          icon: Settings,
          items: [
            {
              title: "Perfil",
              icon: UserRound,
              url: "/settings",
            },
            {
              title: "Seguridad",
              icon: Lock,
              url: "/settings/security",
            },
          ],
        },
      ],
    },
  ],
};
