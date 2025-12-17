import { Briefcase, CheckCircle, Lock, RefreshCw, Send, Settings, Shield, Unlock, User } from "lucide-react";

import { Permission } from "../_types/roles";
import { EnumAction, EnumResource } from "../../settings/_types/roles.types";

// Etiquetas de acciones (fuente de verdad del backend)
export const labelPermission: Record<string, string> = {
  [EnumAction.create]: "Crear",
  [EnumAction.read]: "Ver",
  [EnumAction.update]: "Actualizar",
  [EnumAction.delete]: "Eliminar",
  [EnumAction.assign]: "Asignar",
  [EnumAction.approve]: "Aprobar",
  [EnumAction.export]: "Exportar",
  [EnumAction.reactivate]: "Reactivar",
  [EnumAction.wildcard]: "Acceso total",
};

// Etiquetas de recursos (fuente de verdad del backend)
export const labelResource: Record<string, string> = {
  [EnumResource.users]: "Usuarios",
  [EnumResource.projects]: "Proyectos",
  [EnumResource.clients]: "Clientes",
  [EnumResource.milestones]: "Hitos",
  [EnumResource.phases]: "Fases",
  [EnumResource.deliverables]: "Entregables",
  [EnumResource.activities]: "Actividades",
  [EnumResource.roles]: "Roles",
  [EnumResource.notifications]: "Notificaciones",
  [EnumResource.reports]: "Reportes",
  [EnumResource.dashboard]: "Dashboard",
  [EnumResource.resources]: "Recursos",
  [EnumResource.projectResources]: "Recursos de proyecto",
  [EnumResource.system]: "Sistema",
  [EnumResource.base]: "Base",
};

// Íconos por recurso
export const resourceIcons: Record<string, typeof Briefcase> = {
  projects: Briefcase,
  clients: User,
  milestones: CheckCircle,
  phases: Settings,
  deliverables: Send,
  activities: RefreshCw,
  users: User,
  reports: Shield,
  dashboard: Settings,
  system: Lock,
  notifications: Shield,
  roles: Shield,
  resources: Settings,
  "project-resources": Settings,
  base: Shield,
  "*": Unlock,
};

// Colores por acción (fuente de verdad del backend)
export const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-700 border-green-200",
  read: "bg-blue-100 text-blue-700 border-blue-200",
  update: "bg-yellow-100 text-yellow-700 border-yellow-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  assign: "bg-purple-100 text-purple-700 border-purple-200",
  approve: "bg-emerald-100 text-emerald-700 border-emerald-200",
  export: "bg-cyan-100 text-cyan-700 border-cyan-200",
  reactivate: "bg-orange-100 text-orange-700 border-orange-200",
  "*": "bg-purple-100 text-purple-700 border-purple-200",
};

// Traducción de recursos
export function translateResource(resource: string): string {
  return labelResource[resource] || resource;
}

// Traducción de acciones
export function translateAction(action: string): string {
  const map: Record<string, string> = {
    ...labelPermission,
    "*": "Todas las acciones",
  };
  return map[action] || action;
}

export type GroupedPermission = {
  resource: string;
  actions: { action: string; id: string; description: string }[];
};

/**
 * Agrupa los permisos disponibles por recurso y acción usando el DTO Permission
 */
export function groupedPermission(permissions: Permission | undefined): GroupedPermission[] {
  if (!permissions || !Array.isArray(permissions.combinations)) return [];

  return permissions.resources.map((resource) => {
    const actions = permissions.combinations
      .filter((comb) => comb.startsWith(`${resource}:`))
      .map((comb) => {
        const [, action] = comb.split(":");
        return {
          action,
          id: comb,
          description: `${translateAction(action)} ${translateResource(resource)}`,
        };
      });
    return { resource, actions };
  });
}

// Plantillas de roles predefinidas (alineadas con backend)
export const roleTemplates = {
  admin: {
    name: "Administrador",
    description: "Acceso completo a todos los recursos",
    permissions: "all",
  },
  manager: {
    name: "Gerente",
    description: "Gestión de proyectos y equipos",
    permissions: [
      "projects:create",
      "projects:read",
      "projects:update",
      "users:read",
      "reports:read",
      "dashboard:read",
    ],
  },
  viewer: {
    name: "Visualizador",
    description: "Solo lectura en todos los recursos",
    permissions: "read-only",
  },
};
