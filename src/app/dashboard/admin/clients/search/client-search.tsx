"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { AutoComplete, Option } from "@/shared/components/ui/autocomplete";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchClients } from "../_hooks/use-clients";
import { ClientProfileResponseDto } from "../_types/clients.types";

interface ClientSearchProps {
  disabled?: boolean;
  value: string;
  onDuplicate: (client: ClientProfileResponseDto) => boolean;
  onAddItem: (clientId: string, client: ClientProfileResponseDto) => void;
  filterByActive?: boolean | undefined; // true = solo activos, false = solo inactivos, undefined = todos
}

export function ClientSearch({ disabled, value, onAddItem, onDuplicate, filterByActive }: ClientSearchProps) {
  const isDuplicate = useRef(false);
  const { allClients, query, handleScrollEnd, handleSearchChange, search, handleIsActiveFilter } = useSearchClients();

  // Aplicar filtro por estado activo cuando se pase el prop
  useEffect(() => {
    if (filterByActive !== undefined) {
      handleIsActiveFilter(filterByActive);
    }
  }, [filterByActive, handleIsActiveFilter]);

  const clients: Option<ClientProfileResponseDto>[] = useMemo(() => {
    // Asegurar que allClients sea un array
    if (!allClients || !Array.isArray(allClients)) {
      return [];
    }

    return allClients.map((client) => ({
      value: client.id,
      label: client.name,
      entity: client,
      component: (
        <div className="grid grid-cols-2 gap-2 w-full" title={client.name}>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold truncate">{client.name}</span>
            <span className="text-xs text-muted-foreground truncate">RUC: {client._ruc.value}</span>
            <span className="text-xs text-muted-foreground truncate">{client._email.value}</span>
            {client.sunatInfo && (
              <span className="text-xs text-blue-600 font-medium">
                {client.sunatInfo.state} - {client.sunatInfo.condition}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge
              className={cn(
                "text-xs font-semibold",
                client.isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              )}
            >
              {client.isActive ? "Activo" : "Inactivo"}
            </Badge>
            {client.sunatInfo && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  client.sunatInfo.state === "ACTIVO"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                )}
              >
                {client.sunatInfo.state}
              </Badge>
            )}
          </div>
        </div>
      ),
    }));
  }, [allClients]);

  const selectedClient = clients.find((client) => client.value === value);

  // Crear una versión simple para el trigger (solo nombre)
  const selectedClientSimple =
    selectedClient && selectedClient.entity
      ? {
          ...selectedClient,
          component: (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{selectedClient.entity.name}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  selectedClient.entity.isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-red-100 text-red-800 border-red-200"
                )}
              >
                {selectedClient.entity.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          ),
        }
      : undefined;

  const handleSelect = ({ value, entity }: Option<ClientProfileResponseDto>) => {
    if (!entity) {
      toast.error("No se pudo seleccionar el cliente. Por favor, inténtalo de nuevo.");
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
    <AutoComplete<ClientProfileResponseDto>
      queryState={query}
      options={clients}
      value={selectedClientSimple}
      onValueChange={handleSelect}
      onSearchChange={handleSearchChange}
      onScrollEnd={handleScrollEnd}
      onPreventSelection={() => {
        let shouldPreventSelection = true;
        // Si el cliente ya está en la lista, no permitir la selección
        if (isDuplicate.current) {
          return shouldPreventSelection; // Bloquear la selección
        }

        shouldPreventSelection = false; // Permitir la selección si no es duplicado
        return shouldPreventSelection;
      }}
      placeholder="Selecciona un cliente..."
      searchPlaceholder="Buscar por nombre, RUC o email..."
      emptyMessage={search !== "" ? `No se encontraron resultados para "${search}"` : "No se encontraron clientes"}
      debounceMs={400}
      regexInput={/^[a-zA-Z0-9\s\-.@]*$/}
      className="w-full"
      commandContentClassName="min-w-[400px]"
      variant="outline"
      disabled={disabled}
    />
  );
}
