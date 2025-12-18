"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { usePermissionCheckHook, type ActionName, type ResourceName } from "@/shared/components/protected-component";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/shared/components/ui/command";
import { useSearch } from "@/shared/context/search-context";
import { sidebarData } from "../layout/data/sidebar-data";
import { type NavItem } from "../layout/data/types";
import { ScrollArea } from "./scroll-area";

// Función helper para parsear permisos del formato "resource:action"
const parsePermission = (permissionString: string): { resource: ResourceName; action: ActionName } | null => {
  const [resource, action] = permissionString.split(":");
  if (!resource || !action) return null;

  return {
    resource: resource as ResourceName,
    action: action as ActionName,
  };
};

// Función helper para verificar permisos de navegación
const hasNavPermission = (
  item: NavItem,
  hasPermission: (resource: ResourceName, action: ActionName) => boolean,
  hasRole: (role: string) => boolean
): boolean => {
  // Si el item no tiene restricciones, mostrar siempre
  if (!item.permission && !item.roles) {
    return true;
  }

  // Verificar roles si están definidos
  if (item.roles && item.roles.length > 0) {
    const hasRequiredRole = item.roles.some((role: string) => hasRole(role));
    if (!hasRequiredRole) {
      return false;
    }
  }

  // Verificar permisos si están definidos
  if (item.permission) {
    const parsed = parsePermission(item.permission);
    if (!parsed) return false;

    const { resource, action } = parsed;
    // Si la acción es "*", verificar si tiene el wildcard del recurso
    if (action === "*") {
      if (!hasPermission(resource, "*" as ActionName)) {
        return false;
      }
    } else {
      // Verificar permiso específico o wildcard
      if (!hasPermission(resource, action) && !hasPermission(resource, "*" as ActionName)) {
        return false;
      }
    }
  }

  return true;
};

export function CommandMenu() {
  const navigate = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const { isAuthenticated, hasPermission, hasRole } = usePermissionCheckHook();

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  // Si no está autenticado, no mostrar nada
  if (!isAuthenticated) {
    return null;
  }

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Busca un módulo ..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pr-1">
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          {sidebarData?.navGroups.map((group) => {
            // Verificar permisos a nivel de grupo
            if (group.permission || group.roles) {
              // Verificar roles si están definidos
              if (group.roles && group.roles.length > 0) {
                const hasRequiredRole = group.roles.some((role: string) => hasRole(role));
                if (!hasRequiredRole) {
                  return null;
                }
              }

              // Verificar permisos si están definidos
              if (group.permission) {
                const parsed = parsePermission(group.permission);
                if (parsed) {
                  const { resource, action } = parsed;
                  if (action === "*") {
                    if (!hasPermission(resource, "*" as ActionName)) {
                      return null;
                    }
                  } else {
                    if (!hasPermission(resource, action) && !hasPermission(resource, "*" as ActionName)) {
                      return null;
                    }
                  }
                } else {
                  return null;
                }
              }
            }

            // Filtrar items basado en permisos
            const filteredItems = group.items.filter((item) => {
              if (item.hideInSidebar) {
                return false;
              }
              return hasNavPermission(item, hasPermission, hasRole);
            });

            // Si no hay items visibles, no mostrar el grupo
            if (filteredItems.length === 0) {
              return null;
            }

            return (
              <CommandGroup key={group.title} heading={group.title}>
                {filteredItems.map((navItem, i) => {
                  if (navItem.url) {
                    // Item directo sin sub-items
                    return (
                      <CommandItem
                        key={`${navItem.url}-${i}`}
                        value={navItem.title}
                        onSelect={() => {
                          runCommand(() => navigate.push(navItem.url as string));
                        }}
                        className="group/item"
                      >
                        <div className="mr-2 flex size-5 group-hover/item:shadow-sm transition-colors duration-200 items-center justify-center bg-background rounded-sm">
                          <CornerDownRight />
                        </div>
                        {navItem.title}
                      </CommandItem>
                    );
                  }

                  // Item con sub-items - filtrar sub-items también
                  const filteredSubItems = navItem.items?.filter((subItem) =>
                    hasNavPermission(subItem, hasPermission, hasRole)
                  );

                  if (!filteredSubItems || filteredSubItems.length === 0) {
                    return null;
                  }

                  return filteredSubItems.map((subItem, j) => (
                    <CommandItem
                      key={`${subItem.url}-${j}`}
                      value={subItem.title}
                      onSelect={() => {
                        runCommand(() => navigate.push(subItem.url as string));
                      }}
                      className="group/item"
                    >
                      <div className="mr-2 flex size-5 group-hover/item:shadow-sm transition-colors duration-200 shadow-sm items-center justify-center bg-background rounded-sm">
                        <CornerDownRight />
                      </div>
                      {subItem.title}
                    </CommandItem>
                  ));
                })}
              </CommandGroup>
            );
          })}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun /> <span>Claro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="scale-90" />
              <span>Oscuro</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop />
              <span>Sistema</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
