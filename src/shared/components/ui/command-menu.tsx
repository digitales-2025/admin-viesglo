"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";
import { useAuth } from "@/auth/presentation/providers/AuthProvider";
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
import { clinicSidebarData } from "../layout/data/clinic-sidebar-data";
import { sidebarData } from "../layout/data/sidebar-data";
import { NavItem, SidebarData } from "../layout/data/types";
import { ScrollArea } from "./scroll-area";

export function CommandMenu() {
  const navigate = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();
  const [data, setData] = React.useState<SidebarData>();
  const [filteredData, setFilteredData] = useState<SidebarData | undefined>();
  const { hasPermission } = useAuth();

  // Vamos a ser una busqueda de acuerto al usuario
  const { data: user } = useCurrentUser();

  useEffect(() => {
    switch (user?.type) {
      case "admin":
        setData(sidebarData);
        break;
      case "clinic":
        setData(clinicSidebarData);
        break;
      default:
        setData(undefined);
        break;
    }
  }, [user]);

  // Aplicar filtro de permisos cuando cambie data
  useEffect(() => {
    if (!data) {
      setFilteredData(undefined);
      return;
    }

    const checkItemPermissions = async (itemsToCheck: NavItem[]): Promise<NavItem[]> => {
      // Verificar permisos en paralelo para todos los items
      const itemsWithPermissions = await Promise.all(
        itemsToCheck.map(async (item) => {
          // Verificar permisos del elemento actual
          let hasAccess = true;
          if (item.permissions && item.permissions.length > 0) {
            // Verificar si tiene al menos uno de los permisos
            const permissionChecks = await Promise.all(
              item.permissions.map((permission) => hasPermission(permission.resource || "", permission.action || ""))
            );
            hasAccess = permissionChecks.some(Boolean);
          }

          // Verificar permisos de los items hijos recursivamente
          let filteredItems: NavItem[] = [];
          if (item.items && item.items.length > 0) {
            filteredItems = await checkItemPermissions(item.items);
          }

          // Si el item tiene acceso directo o tiene hijos con acceso, incluirlo
          if (hasAccess || filteredItems.length > 0) {
            return {
              ...item,
              items: filteredItems.length > 0 ? filteredItems : item.items,
            };
          }

          // No tiene acceso, retornar null para filtrarlo después
          return null;
        })
      );

      // Filtrar los items nulos (sin acceso)
      return itemsWithPermissions.filter(Boolean) as NavItem[];
    };

    const applyPermissionsFilter = async () => {
      const filteredGroups = await Promise.all(
        data.navGroups.map(async (group) => {
          const filteredItems = await checkItemPermissions(group.items);

          // Solo incluir grupos que tengan al menos un item con acceso
          if (filteredItems.length > 0) {
            return {
              ...group,
              items: filteredItems,
            };
          }

          return null;
        })
      );

      // Actualizar el estado con los grupos filtrados (excluyendo los nulos)
      setFilteredData({
        ...data,
        navGroups: filteredGroups.filter(Boolean),
      } as SidebarData);
    };

    applyPermissionsFilter();
  }, [data, hasPermission]);

  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false);
      command();
    },
    [setOpen]
  );

  return (
    <CommandDialog modal open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Busca un módulo ..." />
      <CommandList>
        <ScrollArea type="hover" className="h-72 pr-1">
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          {filteredData?.navGroups.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group.items.map((navItem, i) => {
                if (navItem.url)
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

                return navItem.items?.map((subItem, i) => (
                  <CommandItem
                    key={`${subItem.url}-${i}`}
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
          ))}
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun /> <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="scale-90" />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  );
}
