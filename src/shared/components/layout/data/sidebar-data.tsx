import {
  Banknote,
  BriefcaseBusiness,
  Building,
  Files,
  GraduationCap,
  Group,
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

import { EnumAction, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
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
          permissions: [{ resource: EnumResource.projects, action: EnumAction.read }],
        },
        {
          title: "Salud Ocupacional",
          icon: SquareActivity,
          url: "/medical-records",
          permissions: [{ resource: EnumResource.occupationalHealth, action: EnumAction.read }],
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
          permissions: [{ resource: EnumResource.clinics, action: EnumAction.read }],
        },
        {
          title: "Clientes",
          icon: Building,
          url: "/clients",
          permissions: [{ resource: EnumResource.clients, action: EnumAction.read }],
        },
        {
          title: "Servicios",
          icon: BriefcaseBusiness,
          url: "/services",
          permissions: [{ resource: EnumResource.services, action: EnumAction.read }],
        },
        {
          title: "Grupos de cotizaciones",
          icon: Group,
          url: "/quotation-groups",
          permissions: [{ resource: EnumResource.quotations, action: EnumAction.read }],
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
          permissions: [{ resource: EnumResource.quotations, action: EnumAction.read }],
        },
        {
          title: "Pagos",
          icon: Banknote,
          url: "/payment",
          permissions: [{ resource: EnumResource.payments, action: EnumAction.read }],
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
          permissions: [{ resource: EnumResource.certificate, action: EnumAction.read }],
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
              permissions: [{ resource: EnumResource.users, action: EnumAction.read }],
            },
            {
              title: "Roles y permisos",
              icon: KeyRound,
              url: "/roles",
              permissions: [{ resource: EnumResource.roles, action: EnumAction.read }],
            },
          ],
          permissions: [
            { resource: EnumResource.users, action: EnumAction.read },
            { resource: EnumResource.roles, action: EnumAction.read },
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
