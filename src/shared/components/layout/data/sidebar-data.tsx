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

import { EnumPermission, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
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
          permissions: [{ resource: EnumResource.projects, action: EnumPermission.read }],
        },
        {
          title: "Salud Ocupacional",
          icon: SquareActivity,
          url: "/medical-records",
          permissions: [{ resource: EnumResource.occupationalHealth, action: EnumPermission.read }],
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
          permissions: [{ resource: EnumResource.clinics, action: EnumPermission.read }],
        },
        {
          title: "Clientes",
          icon: Building,
          url: "/clients",
          permissions: [{ resource: EnumResource.clients, action: EnumPermission.read }],
        },
        {
          title: "Servicios",
          icon: BriefcaseBusiness,
          url: "/services",
          permissions: [{ resource: EnumResource.services, action: EnumPermission.read }],
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
          permissions: [{ resource: EnumResource.quotations, action: EnumPermission.read }],
        },
        {
          title: "Pagos",
          icon: Banknote,
          url: "/payment",
          permissions: [{ resource: EnumResource.payments, action: EnumPermission.read }],
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
          permissions: [{ resource: EnumResource.trainings, action: EnumPermission.read }],
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
              permissions: [{ resource: EnumResource.users, action: EnumPermission.read }],
            },
            {
              title: "Roles y permisos",
              icon: KeyRound,
              url: "/roles",
              permissions: [{ resource: EnumResource.roles, action: EnumPermission.read }],
            },
          ],
          permissions: [
            { resource: EnumResource.users, action: EnumPermission.read },
            { resource: EnumResource.roles, action: EnumPermission.read },
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
