"use client";

export const USERS_PROJECTS_KEYS = {
  all: ["UserProject"] as const,
  lists: () => [...USERS_PROJECTS_KEYS.all, "list"] as const,
  list: (filters: string) => [...USERS_PROJECTS_KEYS.lists(), { filters }] as const,
  details: () => [...USERS_PROJECTS_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_PROJECTS_KEYS.details(), id] as const,
  permissions: () => [...USERS_PROJECTS_KEYS.all, "permissions"] as const,
  permissionsDetail: (id: string) => [...USERS_PROJECTS_KEYS.permissions(), id] as const,
  project: () => [...USERS_PROJECTS_KEYS.all, "list"] as const,
  search: (filter: string) => [...USERS_PROJECTS_KEYS.all, "search", filter] as const,
};
