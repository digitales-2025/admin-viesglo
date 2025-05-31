import {
  Banknote,
  BriefcaseBusiness,
  Building,
  Files,
  FileText,
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

import { EnumAction, EnumResource } from "@/app/dashboard/admin/roles/_utils/groupedPermission";
import { type SidebarData } from "./types";

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Inicio",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
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
          url: "/dashboard/admin/tracking",
          permissions: [{ resource: EnumResource.projects, action: EnumAction.read }],
        },
        {
          title: "Salud Ocupacional",
          icon: SquareActivity,
          url: "/dashboard/admin/medical-records",
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
          url: "/dashboard/admin/clinics",
          permissions: [{ resource: EnumResource.clinics, action: EnumAction.read }],
        },
        {
          title: "Clientes",
          icon: Building,
          url: "/dashboard/admin/clients",
          permissions: [{ resource: EnumResource.clients, action: EnumAction.read }],
        },
        {
          title: "Servicios",
          icon: BriefcaseBusiness,
          url: "/dashboard/admin/services",
          permissions: [{ resource: EnumResource.services, action: EnumAction.read }],
        },
        {
          title: "Grupos de cotizaciones",
          icon: Group,
          url: "/dashboard/admin/quotation-groups",
          permissions: [{ resource: EnumResource.quotations, action: EnumAction.read }],
        },
        {
          title: "Diagnosticos",
          icon: FileText,
          url: "/dashboard/admin/diagnostics",
          permissions: [{ resource: EnumResource.diagnostic, action: EnumAction.read }],
        },
      ],
    },
    {
      title: "Gestión Comercial",
      items: [
        {
          title: "Cotizaciones",
          icon: Files,
          url: "/dashboard/admin/quotation",
          permissions: [{ resource: EnumResource.quotations, action: EnumAction.read }],
        },
        {
          title: "Pagos",
          icon: Banknote,
          url: "/dashboard/admin/payments",
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
          url: "/dashboard/admin/certificates",
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
              url: "/dashboard/admin/users",
              permissions: [{ resource: EnumResource.users, action: EnumAction.read }],
            },
            {
              title: "Roles y permisos",
              icon: KeyRound,
              url: "/dashboard/admin/roles",
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
              url: "/dashboard/admin/settings",
            },
            {
              title: "Seguridad",
              icon: Lock,
              url: "/dashboard/admin/security",
            },
          ],
        },
      ],
    },
  ],
};
