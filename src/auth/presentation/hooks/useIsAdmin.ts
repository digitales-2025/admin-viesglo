import { useAuth } from "../providers/AuthProvider";

/**
 * Hook que retorna un booleano indicando si el usuario actual es administrador (superadmin)
 *
 * @returns {boolean} - true si el usuario es superadmin, false en caso contrario
 *
 * @example
 * // En un componente
 * const isAdmin = useIsAdmin();
 *
 * // Para filtrar un array
 * const filteredItems = items.filter(item => isAdmin || !item.adminOnly);
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();

  // Verifica si el usuario existe y tiene el rol de superadmin
  const isAdmin = user?.roles?.includes("superadmin") || false;

  return isAdmin;
}
