import { backend } from "@/lib/api/types/backend";

/**
 * Hook para obtener todos los permisos disponibles en el sistema
 */
export const usePermissions = () => {
  const query = backend.useQuery("get", "/v1/roles/permissions/available");
  return query;
};
