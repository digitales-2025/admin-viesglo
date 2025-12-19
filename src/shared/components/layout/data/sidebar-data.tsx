import {
  Briefcase,
  Building2,
  ClipboardCheck,
  FolderKanban /*   GraduationCap, */,
  Hash,
  KeyRound,
  Lock,
  ScrollText,
  Settings,
  Target,
  UserRound,
  Users2,
  UsersRound,
} from "lucide-react";

import LogoSmall from "@/shared/components/icons/LogoSmall";
import { type SidebarData } from "./types";

export const sidebarData: SidebarData = {
  business: {
    name: "Viesglo",
    logo: LogoSmall,
  },
  navGroups: [
    {
      title: "Inicio",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: Hash,
        },
      ],
    },
    {
      title: "Gestión de Administrativa",
      items: [
        {
          title: "Proyectos",
          icon: FolderKanban,
          items: [
            {
              title: "Seguimiento",
              icon: Target,
              url: "/dashboard/admin/project-groups",
              permission: "projects:read",
            },
            {
              title: "Plantillas",
              icon: ScrollText,
              url: "/dashboard/admin/templates",
              permission: "projects:read",
            },
          ],
          permission: "projects:read",
        },
        {
          title: "Recursos",
          icon: Briefcase,
          items: [
            {
              title: "Gestión de Recursos",
              icon: ClipboardCheck,
              url: "/dashboard/admin/resources",
              permission: "resources:read",
            },
          ],
          permission: "resources:read",
        },

        {
          title: "Clientes",
          icon: Building2,
          items: [
            {
              title: "Gestión de Clientes",
              icon: Users2,
              url: "/dashboard/admin/clients",
              permission: "clients:read",
            },
          ],
          permission: "clients:read",
        },
      ],
    },

    /*     {
      title: "Gestión de Capacitaciones",
      items: [
        {
          title: "Certificados",
          icon: GraduationCap,
          url: "/dashboard/admin/certificates",
          permissions: [{ resource: EnumResource.clients, action: EnumAction.read }],
        },
      ],
    }, */
    {
      title: "Gestión de Usuarios",
      items: [
        {
          title: "Usuarios",
          icon: UsersRound,
          items: [
            {
              title: "Usuarios",
              icon: UsersRound,
              url: "/dashboard/admin/users",
              permission: "users:read",
            },
            {
              title: "Roles y permisos",
              icon: KeyRound,
              url: "/dashboard/admin/roles",
              permission: "roles:read",
            },
          ],
          permission: "users:read",
        },
        {
          title: "Configuración",
          icon: Settings,
          items: [
            {
              title: "Perfil",
              icon: UserRound,
              url: "/dashboard/admin/settings/profile",
            },
            {
              title: "Seguridad",
              icon: Lock,
              url: "/dashboard/admin/settings/security",
            },
          ],
        },
      ],
    },
  ],
};
