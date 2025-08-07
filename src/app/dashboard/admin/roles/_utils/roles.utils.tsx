import { Briefcase, CheckCircle, Lock, RefreshCw, Send, Settings, Shield, Unlock, User } from "lucide-react";

import { Permission } from "../_types/roles";

// Acciones válidas
export enum EnumAction {
  read = "read",
  write = "write",
  manage = "manage",
}

// Etiquetas de acciones
export const labelPermission = {
  [EnumAction.read]: "Ver",
  [EnumAction.write]: "Escribir",
  [EnumAction.manage]: "Gestionar",
};

// Recursos válidos
export enum EnumResource {
  users = "users",
  projects = "projects",
  clients = "clients",
  milestones = "milestones",
  phases = "phases",
  deliverables = "deliverables",
  activities = "activities",
  roles = "roles",
  notifications = "notifications",
  reports = "reports",
  dashboard = "dashboard",
  system = "system",
  all = "*",
}

// Etiquetas de recursos
export const labelResource = {
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
  [EnumResource.system]: "Sistema",
  [EnumResource.all]: "Todos los recursos",
};

// Íconos por recurso
export const resourceIcons = {
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
  "*": Unlock,
};

// Colores por acción
export const actionColors = {
  read: "bg-blue-100 text-blue-700 border-blue-200",
  write: "bg-yellow-100 text-yellow-700 border-yellow-200",
  manage: "bg-green-100 text-green-700 border-green-200",
  admin: "bg-red-100 text-red-700 border-red-200",
  "*": "bg-purple-100 text-purple-700 border-purple-200",
};

// Traducción de recursos
export function translateResource(resource: string): string {
  const map: Record<string, string> = labelResource;
  return map[resource] || resource;
}

// Traducción de acciones
export function translateAction(action: string): string {
  const map: Record<string, string> = {
    read: "Ver",
    write: "Escribir",
    manage: "Gestionar",
    admin: "Administrar",
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
