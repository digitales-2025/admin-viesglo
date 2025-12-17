import { components } from "@/lib/api/types/api";

export type Roles = components["schemas"]["RoleResponseDto"];

export type RoleListItem = components["schemas"]["RoleListItemDto"];

export type ResourceName = components["schemas"]["PermissionRequestDto"]["resource"];

export type ActionName = components["schemas"]["PermissionRequestDto"]["action"];

// Recursos válidos (fuente de verdad del backend)
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
  resources = "resources",
  projectResources = "project-resources",
  system = "system",
  base = "base",
}

// Acciones válidas (fuente de verdad del backend)
export enum EnumAction {
  create = "create",
  read = "read",
  update = "update",
  delete = "delete",
  assign = "assign",
  approve = "approve",
  export = "export",
  reactivate = "reactivate",
  wildcard = "*", // Solo para roles del sistema
}
