import { Permission } from "../_types/roles";

export function groupedPermission(permissions: Permission[]) {
  return Object.values(
    permissions?.reduce<Record<string, { resource: string; actions: any[] }>>((acc, { resource, ...rest }) => {
      acc[resource] = acc[resource] || { resource, actions: [] };
      acc[resource].actions.push(rest);
      return acc;
    }, {}) || {}
  );
}
