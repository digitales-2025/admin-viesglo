"use client";

import { useEffect, useMemo, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { AutoComplete, Option } from "@/shared/components/ui/autocomplete";
import { Badge } from "@/shared/components/ui/badge";
import { useSearchClients } from "../_hooks/use-clients";
import { ClientProfileResponseDto } from "../_types/clients.types";
import { clientConditionConfig, clientStateConfig } from "../_utils/clients.utils";

// Función para obtener configuración visual del estado SUNAT
const getSunatStateConfig = (state: string) => {
  const config = clientStateConfig[state as keyof typeof clientStateConfig];
  if (config) {
    return {
      ...config,
    };
  }

  // Fallback con tipos correctos
  return {
    label: state,
    description: `Estado: ${state}`,
    className: "bg-gray-200 dark:bg-gray-800/40",
    textClass: "text-gray-900 dark:text-gray-200",
    borderColor: "border-gray-400 dark:border-gray-600",
    hoverClass: "hover:bg-gray-300 dark:hover:bg-gray-700/60",
    icon: CheckCircle,

    iconClass: "text-gray-600 dark:text-gray-300",
  };
};

// Función para obtener configuración visual de la condición SUNAT
const getSunatConditionConfig = (condition: string) => {
  const config = clientConditionConfig[condition as keyof typeof clientConditionConfig];
  if (config) {
    return {
      ...config,
    };
  }

  // Fallback con tipos correctos
  return {
    label: condition,
    description: `Condición: ${condition}`,
    className: "bg-gray-200 dark:bg-gray-800/40",
    textClass: "text-gray-900 dark:text-gray-200",
    borderColor: "border-gray-400 dark:border-gray-600",
    hoverClass: "hover:bg-gray-300 dark:hover:bg-gray-700/60",
    icon: CheckCircle,
    iconClass: "text-gray-600 dark:text-gray-300",
    extra: "Sin información",
  };
};

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
              <div className="flex flex-col gap-1 mt-1">
                <div className="flex items-center gap-1">
                  {(() => {
                    const stateConfig = getSunatStateConfig(client.sunatInfo.state);
                    const conditionConfig = getSunatConditionConfig(client.sunatInfo.condition);
                    const StateIcon = stateConfig.icon;
                    const ConditionIcon = conditionConfig.icon;

                    return (
                      <>
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1 text-xs w-fit",
                            stateConfig.textClass,
                            stateConfig.borderColor
                          )}
                        >
                          <StateIcon className={cn("h-3 w-3", stateConfig.iconClass)} />
                          {stateConfig.label}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1 text-xs w-fit",
                            conditionConfig.textClass,
                            conditionConfig.borderColor
                          )}
                        >
                          <ConditionIcon className={cn("h-3 w-3", conditionConfig.iconClass)} />
                          {conditionConfig.label}
                        </Badge>
                      </>
                    );
                  })()}
                </div>
                {(client.sunatInfo.state !== "ACTIVO" || client.sunatInfo.condition !== "HABIDO") && (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">⚠️ Requiere atención</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge
              variant={client.isActive ? "default" : "destructive"}
              className="flex items-center gap-1 w-fit text-xs"
            >
              {client.isActive ? (
                <CheckCircle className="h-3 w-3 text-white" />
              ) : (
                <XCircle className="h-3 w-3 text-white" />
              )}
              {client.isActive ? "Activo" : "Inactivo"}
            </Badge>
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
      disabled={disabled}
    />
  );
}
