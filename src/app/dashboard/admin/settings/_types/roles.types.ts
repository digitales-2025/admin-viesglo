import { components } from "@/lib/api/types/api";

export type Roles = components["schemas"]["RoleResponseDto"];

export type RoleListItem = components["schemas"]["RoleListItemDto"];

export type ResourceName = components["schemas"]["PermissionRequestDto"]["resource"];

export type SimplifiedActionName = components["schemas"]["PermissionRequestDto"]["action"];

// Recursos válidos
export enum EnumResource {
  users = "users",
  projects = "projects",
  clients = "clients",
  milestones = "milestones",
  resources = "resources",
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

// Acciones válidas
export enum EnumAction {
  read = "read",
  write = "write",
  manage = "manage",
}
