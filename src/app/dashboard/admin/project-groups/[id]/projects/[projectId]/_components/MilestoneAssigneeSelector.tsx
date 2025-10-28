"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, User } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { useSearchUsers } from "@/app/dashboard/admin/users/_hooks/use-users";
import { components } from "@/lib/api/types/api";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { cn } from "@/shared/lib/utils";
import { useAssignMilestone } from "../_hooks/use-project-milestones";

// Usar el tipo correcto del backend
type UserSummaryResponseDto = components["schemas"]["UserSummaryResponseDto"];

interface MilestoneAssigneeSelectorProps {
  projectId: string;
  milestoneId: string;
  currentAssignee?: UserSummaryResponseDto | null;
  onAssignmentChange?: (user: UserSummaryResponseDto | null) => void;
  disabled?: boolean;
  readOnly?: boolean; // Modo de solo lectura - no permite cambios
  // Props de filtrado flexibles (igual que UserSearch)
  filterByActive?: boolean | undefined; // true = solo activos, false = solo inactivos, undefined = todos
  filterByRoleId?: string | undefined; // ID específico del rol
  filterBySystemRolePosition?: 1 | 2 | 3 | undefined; // Posición del rol del sistema
  // Props adicionales para personalización
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  showUnassigned?: boolean; // Mostrar opción "Sin asignar"
  showAutomatic?: boolean; // Mostrar opción "Automático"
  className?: string;
  commandContentClassName?: string;
  avatarSize?: "sm" | "md" | "lg"; // Tamaño del avatar
  // Props de posicionamiento (como en Command/Dropdown)
  align?: "start" | "center" | "end"; // Alineación del dropdown
  side?: "top" | "bottom"; // Lado donde aparece
  sideOffset?: number; // Offset en píxeles
}

// Función para generar iniciales
const getInitials = (name: string, lastName?: string) => {
  const firstInitial = name?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
};

// Función para generar color único basado en el nombre
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-cyan-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

// Componente Avatar
const UserAvatar = ({
  user,
  size = "sm",
  sizeClasses,
  iconSizes,
}: {
  user?: UserSummaryResponseDto | null;
  size?: "sm" | "md" | "lg";
  sizeClasses: Record<string, string>;
  iconSizes: Record<string, string>;
}) => {
  if (!user) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-muted flex items-center justify-center`}>
        <User className={`${iconSizes[size]} text-muted-foreground`} />
      </div>
    );
  }

  const initials = getInitials(user.name, user.lastName);
  const colorClass = getAvatarColor(user.name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${colorClass} flex items-center justify-center text-white font-medium`}
    >
      {initials}
    </div>
  );
};

export function MilestoneAssigneeSelector({
  projectId,
  milestoneId,
  currentAssignee,
  onAssignmentChange,
  disabled = false,
  readOnly = false, // Por defecto no es solo lectura
  // Props de filtrado
  filterByActive = true, // Por defecto solo usuarios activos
  filterByRoleId,
  filterBySystemRolePosition,
  // Props de personalización
  searchPlaceholder = "Buscar por nombre o email...",
  emptyMessage,
  showUnassigned = true,
  showAutomatic = true,
  className,
  commandContentClassName = "min-w-[320px]",
  avatarSize = "sm", // Tamaño por defecto
  // Props de posicionamiento
  align = "start", // Por defecto alineado al inicio
  side = "bottom", // Por defecto aparece abajo
  sideOffset = 4, // 4px de separación
}: MilestoneAssigneeSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

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

  const { mutate: assignMilestone, isPending } = useAssignMilestone();

  // Definir tamaños para avatares e iconos
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  // Aplicar filtros cuando se pasen los props (igual que UserSearch)
  useMemo(() => {
    if (filterByActive !== undefined) {
      handleIsActiveFilter(filterByActive);
    }
  }, [filterByActive, handleIsActiveFilter]);

  useMemo(() => {
    if (filterByRoleId !== undefined) {
      handleRoleIdFilter(filterByRoleId);
    }
  }, [filterByRoleId, handleRoleIdFilter]);

  useMemo(() => {
    if (filterBySystemRolePosition !== undefined) {
      handleSystemRolePositionFilter(filterBySystemRolePosition);
    }
  }, [filterBySystemRolePosition, handleSystemRolePositionFilter]);

  // Callback con debounce para búsqueda
  const debouncedSearch = useDebouncedCallback((term: string) => {
    handleSearchChange(term);
  }, 400);

  // Manejo de cambios en el input
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      debouncedSearch(newValue);
    },
    [debouncedSearch]
  );

  // Cerrar al hacer click fuera del componente
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!containerRef.current || !target) return;
      if (!containerRef.current.contains(target)) {
        setOpen(false);
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [isOpen]);

  // Opciones especiales + usuarios
  const options = useMemo(() => {
    const specialOptions = [];

    // Agregar opciones especiales según configuración
    if (showUnassigned) {
      specialOptions.push({
        value: "unassigned",
        label: "Sin asignar",
        entity: null,
        component: (
          <div className="flex items-center gap-3">
            <div className={`${sizeClasses[avatarSize]} rounded-full bg-muted flex items-center justify-center`}>
              <User className={`${iconSizes[avatarSize]} text-muted-foreground`} />
            </div>
            <span className="text-sm font-medium">Sin asignar</span>
          </div>
        ),
      });
    }

    const userOptions =
      allUsers?.map((user) => {
        // Convertir UserResponse a UserSummaryResponseDto para el avatar
        const userSummary: UserSummaryResponseDto = {
          userId: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          role: user.role?.name || "Sin rol",
        };

        return {
          value: user.id,
          label: `${user.name} ${user.lastName}`,
          entity: user,
          component: (
            <div className="flex items-center gap-3">
              <UserAvatar user={userSummary} size={avatarSize} sizeClasses={sizeClasses} iconSizes={iconSizes} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user.name} {user.lastName}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
              </div>
            </div>
          ),
        };
      }) || [];

    return [...specialOptions, ...userOptions];
  }, [allUsers, showUnassigned, showAutomatic, avatarSize]);

  const handleSelect = (option: any) => {
    if (isPending || readOnly) return; // No permitir cambios en modo readonly

    const selectedUser = option.entity;

    // Si no hay usuario seleccionado (Sin asignar), desasignar
    if (!selectedUser) {
      // Actualizar UI inmediatamente
      onAssignmentChange?.(null);

      // Llamar al backend con consultantId vacío para desasignar
      assignMilestone(
        {
          params: {
            path: {
              projectId,
              milestoneId,
            },
          },
          body: {
            consultantId: "", // Enviar string vacío para desasignar
          },
        },
        {
          onError: () => {
            // Revertir cambio en caso de error
            onAssignmentChange?.(currentAssignee || null);
          },
          onSuccess: () => {
            setOpen(false);
            setInputValue("");
          },
        }
      );
      return;
    }

    // Convertir UserResponse a UserSummaryResponseDto
    const userSummary: UserSummaryResponseDto = {
      userId: selectedUser.id,
      name: selectedUser.name,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      role: selectedUser.role?.name || "Sin rol",
    };

    // Actualizar UI inmediatamente
    onAssignmentChange?.(userSummary);

    // Llamar al backend para asignar usuario
    assignMilestone(
      {
        params: {
          path: {
            projectId,
            milestoneId,
          },
        },
        body: {
          consultantId: selectedUser.id,
        },
      },
      {
        onError: () => {
          // Revertir cambio en caso de error
          onAssignmentChange?.(currentAssignee || null);
        },
        onSuccess: () => {
          setOpen(false);
          setInputValue("");
        },
      }
    );
  };

  // Manejador de scroll para detectar cuando llegar al final
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px de margen

      if (isAtBottom) {
        handleScrollEnd();
      }
    },
    [handleScrollEnd]
  );

  // Estados de la query
  const isLoading = Boolean(query?.isLoading);
  const isError = Boolean(query?.isError);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger: Solo avatar clickeable */}
      <div
        className={cn(
          "transition-opacity",
          // En modo readonly, no es clickeable
          readOnly ? "cursor-default" : "cursor-pointer",
          (disabled || isPending || readOnly) && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && !isPending && !readOnly && setOpen(true)}
      >
        <UserAvatar user={currentAssignee} size={avatarSize} sizeClasses={sizeClasses} iconSizes={iconSizes} />
      </div>

      {/* Dropdown - Solo mostrar si no es readonly */}
      {isOpen && !readOnly && (
        <div
          className={cn(
            "absolute z-50 rounded-md border bg-popover shadow-lg animate-in fade-in-0 zoom-in-95",
            // Posicionamiento vertical
            side === "top" ? "bottom-full mb-1" : "top-full mt-1",
            // Posicionamiento horizontal
            align === "start" && "left-0",
            align === "center" && "left-1/2 -translate-x-1/2",
            align === "end" && "right-0",
            commandContentClassName
          )}
          style={{
            marginTop: side === "bottom" ? sideOffset : undefined,
            marginBottom: side === "top" ? sideOffset : undefined,
          }}
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={inputValue}
              onValueChange={handleInputChange}
              placeholder={searchPlaceholder}
              disabled={disabled}
              className="h-10"
            />

            <CommandList className="max-h-64 overflow-auto" onScroll={handleScroll}>
              {/* Estado de carga */}
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Cargando...</span>
                </div>
              )}

              {/* Estado de error */}
              {isError && (
                <div className="flex flex-col items-center justify-center p-4 space-y-2">
                  <span className="text-sm text-muted-foreground text-center">Error al cargar los datos</span>
                </div>
              )}

              {/* Lista de opciones */}
              {!isLoading && !isError && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = currentAssignee?.userId === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option)}
                        className={cn(
                          "flex w-full items-center gap-2 cursor-pointer",
                          isSelected && "bg-accent text-accent-foreground"
                        )}
                      >
                        {option.component}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 text-emerald-500 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {/* Sin resultados */}
              {!isLoading && !isError && options.length === 0 && (
                <CommandEmpty>
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      {emptyMessage ||
                        (search !== ""
                          ? `No se encontraron resultados para "${search}"`
                          : "No se encontraron consultores")}
                    </p>
                  </div>
                </CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
