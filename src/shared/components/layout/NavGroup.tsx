"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { useAuth } from "@/auth/presentation/providers/AuthProvider";
import { Badge } from "@/shared/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/lib/utils";
import { NavCollapsible, NavItem, NavLink, type NavGroup } from "./data/types";

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
);
function checkIsActive(href: string, item: NavItem, mainNav = false) {
  if (href === item.url) return true;

  if (href.split("?")[0] === item.url) return true;

  if (item?.items?.some((i) => i.url === href)) return true;

  if (item.url && item.url !== "/" && href.startsWith(item.url + "/")) return true;

  if (mainNav && href.split("/")[1] !== "" && String(item?.url)?.split("/")[1] === href.split("/")[1]) {
    return true;
  }

  return false;
}

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={checkIsActive(href, item)} tooltip={item.title}>
        <Link href={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && <item.icon className={cn(checkIsActive(href, item) ? "text-primary" : "")} />}
          <span className={cn(checkIsActive(href, item) ? "font-semibold" : "")}>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({ item, href }: { item: NavCollapsible; href: string }) => {
  const { setOpenMobile } = useSidebar();
  return (
    <Collapsible asChild defaultOpen={checkIsActive(href, item, true)} className={cn("group/collapsible")}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon className={cn(checkIsActive(href, item) ? "text-primary" : "")} />}
            <span className={cn(checkIsActive(href, item) ? "font-semibold" : "")}>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight
              className={cn(
                "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                checkIsActive(href, item) ? "text-primary" : ""
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton asChild isActive={checkIsActive(href, subItem)}>
                  <Link href={subItem.url} onClick={() => setOpenMobile(false)}>
                    {subItem.icon && (
                      <subItem.icon className={cn(checkIsActive(href, subItem) ? "text-primary!" : "")} />
                    )}
                    <span className={cn(checkIsActive(href, subItem) ? "font-semibold" : "")}>{subItem.title}</span>
                    {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({ item, href }: { item: NavCollapsible; href: string }) => {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={checkIsActive(href, item)}>
            {item.icon && <item.icon className={cn(checkIsActive(href, item) ? "text-primary" : "")} />}
            <span className={cn(checkIsActive(href, item) ? "font-semibold" : "")}>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight
              className={cn(
                "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                checkIsActive(href, item) ? "text-primary" : ""
              )}
            />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link href={sub.url} className={cn(checkIsActive(href, sub) ? "bg-secondary" : "")}>
                {sub.icon && <sub.icon className={cn(checkIsActive(href, sub) ? "text-primary" : "")} />}
                <span className={cn(checkIsActive(href, sub) ? "font-semibold" : "")}>{sub.title}</span>
                {sub.badge && <span className="ml-auto text-xs">{sub.badge}</span>}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar();
  const location = usePathname();
  const href = location.split("?")[0];
  const { hasPermission } = useAuth();
  const [accessibleItems, setAccessibleItems] = useState<boolean>(false);
  const [accessibleItemsMap, setAccessibleItemsMap] = useState<Record<string, boolean>>({});

  // Verificar permisos cuando el componente se carga o cuando los items cambian
  useEffect(() => {
    let isMounted = true;

    const checkPermissions = async () => {
      // Verificar permisos para todos los items
      const itemPermissionsMap: Record<string, boolean> = {};

      // Función recursiva para verificar permisos
      const checkItemPermissions = async (itemsToCheck: NavItem[]): Promise<boolean> => {
        // Usar Promise.all para hacer todas las verificaciones en paralelo
        const results = await Promise.all(
          itemsToCheck.map(async (item) => {
            const key = `${item.title}-${item.url}`;

            // Verificar permisos del elemento actual
            let hasAccess = true;
            if (item.permissions && item.permissions.length > 0) {
              // Verificar si tiene al menos uno de los permisos
              const permissionChecks = await Promise.all(
                item.permissions.map((permission) => hasPermission(permission.resource || "", permission.action || ""))
              );
              hasAccess = permissionChecks.some(Boolean);
            }

            // Verificar permisos de los hijos recursivamente
            let childrenHaveAccess = false;
            if (item.items && item.items.length > 0) {
              childrenHaveAccess = await checkItemPermissions(item.items);
            }

            // El item es accesible si tiene permiso directo o si alguno de sus hijos tiene permiso
            const isAccessible = hasAccess || childrenHaveAccess;
            itemPermissionsMap[key] = isAccessible;

            return isAccessible;
          })
        );

        // El grupo es accesible si al menos uno de sus items es accesible
        return results.some(Boolean);
      };

      // Ejecutar la verificación recursiva
      const hasAnyAccessibleItem = await checkItemPermissions(items);

      // Solo actualizar el estado si el componente sigue montado
      if (isMounted) {
        setAccessibleItems(hasAnyAccessibleItem);
        setAccessibleItemsMap(itemPermissionsMap);
      }
    };

    checkPermissions();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [items, hasPermission]);

  // Si no hay elementos accesibles, no mostrar el grupo
  if (!accessibleItems) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          // Verificar si este elemento es accesible según el mapa calculado
          if (!accessibleItemsMap[key]) return null;

          if (!item.items) return <SidebarMenuLink key={key} item={item} href={href} />;

          if (state === "collapsed") return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />;

          return <SidebarMenuCollapsible key={key} item={item} href={href} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
