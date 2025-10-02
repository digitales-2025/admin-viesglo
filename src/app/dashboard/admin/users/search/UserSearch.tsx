"use client";

import { useEffect, useMemo, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { AutoComplete, Option } from "@/shared/components/ui/autocomplete";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchUsers } from "../_hooks/use-users";
import { UserResponse } from "../_types/user.types";

interface UserSearchProps {
  disabled?: boolean;
  value: string;
  onDuplicate: (user: UserResponse) => boolean;
  onAddItem: (userId: string, user: UserResponse) => void;
  filterByActive?: boolean | undefined; // true = solo activos, false = solo inactivos, undefined = todos
  filterByRoleId?: string | undefined; // ID específico del rol
  filterBySystemRolePosition?: 1 | 2 | 3 | undefined; // Posición del rol del sistema
}

export function UserSearch({
  disabled,
  value,
  onAddItem,
  onDuplicate,
  filterByActive,
  filterByRoleId,
  filterBySystemRolePosition,
}: UserSearchProps) {
  const isDuplicate = useRef(false);
  const {
    allUsers,
    query,
    handleScrollEnd,
    handleSearchChange,
    search,
    handleIsActiveFilter,
    handleRoleIdFilter,
    handleSystemRolePositionFilter,
  } = useSearchUsers();

  // Aplicar filtros cuando se pasen los props
  useEffect(() => {
    if (filterByActive !== undefined) {
      handleIsActiveFilter(filterByActive);
    }
  }, [filterByActive, handleIsActiveFilter]);

  useEffect(() => {
    if (filterByRoleId !== undefined) {
      handleRoleIdFilter(filterByRoleId);
    }
  }, [filterByRoleId, handleRoleIdFilter]);

  useEffect(() => {
    if (filterBySystemRolePosition !== undefined) {
      handleSystemRolePositionFilter(filterBySystemRolePosition);
    }
  }, [filterBySystemRolePosition, handleSystemRolePositionFilter]);

  const users: Option<UserResponse>[] = useMemo(() => {
    // Asegurar que allUsers sea un array
    if (!allUsers || !Array.isArray(allUsers)) {
      return [];
    }

    return allUsers.map((user) => ({
      value: user.id,
      label: `${user.name} ${user.lastName}`,
      entity: user,
      component: (
        <div className="grid grid-cols-2 gap-2 w-full" title={`${user.name} ${user.lastName}`}>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold truncate">
              {user.name} {user.lastName}
            </span>
            <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            {user.role && <span className="text-xs text-blue-600 font-medium">{user.role.name}</span>}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge
              variant={user.isActive ? "default" : "destructive"}
              className="flex items-center gap-1 w-fit text-xs"
            >
              {user.isActive ? (
                <CheckCircle className="h-3 w-3 text-white" />
              ) : (
                <XCircle className="h-3 w-3 text-white" />
              )}
              {user.isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      ),
    }));
  }, [allUsers]);

  const selectedUser = users.find((user) => user.value === value);

  // Crear una versión simple para el trigger (solo nombre)
  const selectedUserSimple =
    selectedUser && selectedUser.entity
      ? {
          ...selectedUser,
          component: (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedUser.entity.name} {selectedUser.entity.lastName}
              </span>
            </div>
          ),
        }
      : undefined;

  const handleSelect = ({ value, entity }: Option<UserResponse>) => {
    if (!entity) {
      toast.error("No se pudo seleccionar el usuario. Por favor, inténtalo de nuevo.");
      return;
    }
    const isDuplicateItem = onDuplicate(entity);
    if (!isDuplicateItem) {
      // Si no se debe limpiar el valor seleccionado, no hacemos nada más
      onAddItem(value, entity);
      return;
    }
    isDuplicate.current = isDuplicateItem;
  };

  return (
    <AutoComplete<UserResponse>
      queryState={query}
      options={users}
      value={selectedUserSimple}
      onValueChange={handleSelect}
      onSearchChange={handleSearchChange}
      onScrollEnd={handleScrollEnd}
      onPreventSelection={() => {
        let shouldPreventSelection = true;
        // Si el usuario ya está en la lista, no permitir la selección
        if (isDuplicate.current) {
          return shouldPreventSelection; // Bloquear la selección
        }

        shouldPreventSelection = false; // Permitir la selección si no es duplicado
        return shouldPreventSelection;
      }}
      placeholder="Selecciona un usuario..."
      searchPlaceholder="Buscar por nombre, apellido o email..."
      emptyMessage={search !== "" ? `No se encontraron resultados para "${search}"` : "No se encontraron usuarios"}
      debounceMs={400}
      regexInput={/^[a-zA-Z0-9\s\-.@]*$/}
      className="w-full"
      commandContentClassName="min-w-[400px]"
      disabled={disabled}
    />
  );
}
