"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { usePermissionCheckHook, type ActionName, type ResourceName } from "@/shared/components/protected-component";
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

// Función helper para parsear permisos del formato "resource:action"
const parsePermission = (permissionString: string): { resource: ResourceName; action: ActionName } | null => {
  const [resource, action] = permissionString.split(":");
  if (!resource || !action) return null;

  // Validar que resource y action sean válidos
  // ResourceName puede incluir valores que no están en EnumResource, así que hacemos un cast seguro
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

    // Debug: verificar permisos para plantillas
    if (item.permission === "projects:read" && item.title === "Plantillas") {
      console.log("🔍 Verificando permiso para Plantillas:", item.permission);
      console.log("🔍 Resource:", resource, "Action:", action);
      console.log("🔍 Tiene permiso específico?", hasPermission(resource, action));
      console.log("🔍 Tiene wildcard?", hasPermission(resource, "*" as ActionName));
    }

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

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  if (href === item.url) return true;

  if (href.split("?")[0] === item.url) return true;

  if (item?.items?.some((i) => i.url === href)) return true;

  // Caso especial para /dashboard
  if (item.url === "/dashboard") {
    const dashboardRoutes = ["/dashboard/admin", "/dashboard/clinic", "/dashboard/client"];
    return dashboardRoutes.includes(href);
  }

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

export function NavGroup({ title, items, permission, roles }: NavGroup) {
  const { state } = useSidebar();
  const location = usePathname();
  const href = location.split("?")[0];
  const { isAuthenticated, hasPermission, hasRole } = usePermissionCheckHook();

  // Verificar permisos a nivel de grupo primero
  if (!isAuthenticated) {
    return null;
  }

  // Si el grupo tiene restricciones de permisos o roles, verificarlas
  if (permission || roles) {
    // Verificar roles si están definidos
    if (roles && roles.length > 0) {
      const hasRequiredRole = roles.some((role: string) => hasRole(role));
      if (!hasRequiredRole) {
        return null;
      }
    }

    // Verificar permisos si están definidos
    if (permission) {
      const parsed = parsePermission(permission);
      if (!parsed) return null;

      const { resource, action } = parsed;

      // Debug: verificar permisos para plantillas
      if (permission === "projects:read") {
        console.log("🔍 Verificando permiso para grupo:", permission);
        console.log("🔍 Resource:", resource, "Action:", action);
        console.log("🔍 Tiene permiso específico?", hasPermission(resource, action));
        console.log("🔍 Tiene wildcard?", hasPermission(resource, "*" as ActionName));
      }

      // Si la acción es "*", verificar si tiene el wildcard del recurso
      if (action === "*") {
        if (!hasPermission(resource, "*" as ActionName)) {
          return null;
        }
      } else {
        // Verificar permiso específico o wildcard
        if (!hasPermission(resource, action) && !hasPermission(resource, "*" as ActionName)) {
          return null;
        }
      }
    }
  }

  // Filtrar items basado en permisos individuales y hideInSidebar
  const filteredItems = items.filter((item) => {
    // Ocultar items con hideInSidebar: true
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
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items) {
            return <SidebarMenuLink key={key} item={item} href={href} />;
          }

          // Filtrar sub-items también
          const filteredSubItems = item.items?.filter((subItem) => hasNavPermission(subItem, hasPermission, hasRole));

          // Si no hay sub-items visibles, no mostrar el item padre
          if (!filteredSubItems || filteredSubItems.length === 0) {
            return null;
          }

          // Crear item con sub-items filtrados
          const filteredItem = { ...item, items: filteredSubItems };

          if (state === "collapsed") {
            return <SidebarMenuCollapsedDropdown key={key} item={filteredItem} href={href} />;
          }

          return <SidebarMenuCollapsible key={key} item={filteredItem} href={href} />;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
