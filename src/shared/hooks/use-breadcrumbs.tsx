"use client";

import type React from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { sidebarData } from "../components/layout/data/sidebar-data";
import type { NavItem, SidebarData } from "../components/layout/data/types";

interface BreadcrumbItem {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
  icon?: React.ElementType; // Cambiado para coincidir con el tipo del sidebar
  isId?: boolean;
}

interface SidebarMatch {
  item: NavItem;
  parent?: NavItem;
  group: any;
  depth: number;
}

class BreadcrumbGenerator {
  private readonly sidebar: SidebarData;
  private readonly segmentTitleMap: Record<string, string>;

  constructor(sidebar: SidebarData) {
    this.sidebar = sidebar;
    this.segmentTitleMap = {
      dashboard: "Dashboard",
      account: "Mi Cuenta",
      admin: "Administración",
      users: "Usuarios",
      roles: "Roles y Permisos",
      clients: "Clientes",
      projects: "Proyectos",
      tracking: "Seguimiento",
      templates: "Plantillas",
      resources: "Recursos",
      certificates: "Certificados",
      settings: "Configuración",
      security: "Seguridad",
      create: "Crear",
      edit: "Editar",
      new: "Nuevo",
      view: "Ver",
      details: "Detalles",
      manage: "Gestionar",
      subprojects: "Subproyectos",
      tasks: "Tareas",
      members: "Miembros",
      files: "Archivos",
      reports: "Reportes",
      analytics: "Analíticas",
    };
  }

  private isIdSegment(segment: string): boolean {
    return (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
      /^[0-9]+$/.test(segment) ||
      /^[0-9a-f]{24}$/i.test(segment)
    );
  }

  private generateIdTitle(segment: string, context?: string): string {
    const entityMap: Record<string, string> = {
      projects: "Proyecto",
      users: "Usuario",
      clients: "Cliente",
      roles: "Rol",
      certificates: "Certificado",
      resources: "Recurso",
      tasks: "Tarea",
      subprojects: "Subproyecto",
    };

    const entityName = context ? entityMap[context] : "Elemento";
    const shortId = segment.length > 8 ? `${segment.slice(0, 8)}...` : segment;
    return `${entityName} #${shortId}`;
  }

  private generateSegmentTitle(segment: string, previousSegment?: string): string {
    if (this.isIdSegment(segment)) {
      return this.generateIdTitle(segment, previousSegment);
    }

    return this.segmentTitleMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  }

  private findSidebarMatch(targetPath: string): SidebarMatch | null {
    const searchInItems = (items: NavItem[], parent?: NavItem, group?: any, depth = 0): SidebarMatch | null => {
      for (const item of items) {
        // Handle NavLink items (items with url)
        if ("url" in item && item.url) {
          const itemUrl = typeof item.url === "string" ? item.url : String(item.url);

          if (itemUrl === targetPath) {
            return { item, parent, group: group || parent, depth };
          }
        }

        // Handle NavCollapsible items (items with nested items)
        if ("items" in item && item.items) {
          const found = searchInItems(item.items, item, group || parent, depth + 1);
          if (found) return found;
        }
      }
      return null;
    };

    for (const group of this.sidebar.navGroups) {
      const found = searchInItems(group.items, undefined, group);
      if (found) return found;
    }

    return null;
  }

  private findBestMatch(segments: string[]): SidebarMatch | null {
    let bestMatch: SidebarMatch | null = null;
    let bestScore = 0;

    // Test progressively longer paths
    for (let i = 1; i <= segments.length; i++) {
      const pathToTest = "/" + segments.slice(0, i).join("/");
      const match = this.findSidebarMatch(pathToTest);

      if (match) {
        const pathSegments = pathToTest.split("/").filter(Boolean);
        const score = pathSegments.length * 10 + i;
        if (score > bestScore) {
          bestMatch = match;
          bestScore = score;
        }
      }
    }

    return bestMatch;
  }

  generate(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    const isOnlyDashboard = pathname === "/dashboard";
    const dashboardItem = this.sidebar.navGroups[0]?.items[0];

    breadcrumbs.push({
      title: "Dashboard",
      href: isOnlyDashboard ? undefined : "/dashboard",
      isCurrentPage: isOnlyDashboard,
      icon: dashboardItem?.icon,
    });

    if (isOnlyDashboard) return breadcrumbs;

    // Find the best matching sidebar item
    const bestMatch = this.findBestMatch(segments);
    let currentPath = "";
    let sidebarItemsAdded = false;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const previousSegment = segments[i - 1];
      currentPath += `/${segment}`;

      // Skip dashboard segment as it's already added
      if (i === 0 && segment === "dashboard") continue;

      const isLastSegment = i === segments.length - 1;
      const isId = this.isIdSegment(segment);

      // Check for exact sidebar match
      const exactMatch = this.findSidebarMatch(currentPath);

      if (exactMatch && !sidebarItemsAdded) {
        // Add parent hierarchy if exists
        if (exactMatch.parent && !breadcrumbs.some((b) => b.title === exactMatch.parent!.title)) {
          breadcrumbs.push({
            title: exactMatch.parent.title,
            href: "url" in exactMatch.parent ? String(exactMatch.parent.url) : undefined,
            icon: exactMatch.parent.icon,
          });
        }

        breadcrumbs.push({
          title: exactMatch.item.title,
          href: isLastSegment ? undefined : currentPath,
          isCurrentPage: isLastSegment,
          icon: exactMatch.item.icon,
        });

        sidebarItemsAdded = true;
      } else if (bestMatch && !sidebarItemsAdded && this.shouldAddBestMatch(currentPath, bestMatch)) {
        // Add best match hierarchy
        if (bestMatch.parent && !breadcrumbs.some((b) => b.title === bestMatch.parent!.title)) {
          breadcrumbs.push({
            title: bestMatch.parent.title,
            href: "url" in bestMatch.parent ? String(bestMatch.parent.url) : undefined,
            icon: bestMatch.parent.icon,
          });
        }

        if (!breadcrumbs.some((b) => b.title === bestMatch.item.title)) {
          const bestMatchUrl = "url" in bestMatch.item ? String(bestMatch.item.url) : undefined;
          breadcrumbs.push({
            title: bestMatch.item.title,
            href: bestMatchUrl,
            icon: bestMatch.item.icon,
          });
        }

        sidebarItemsAdded = true;

        // Add current segment if it's beyond the sidebar match
        if ("url" in bestMatch.item && bestMatch.item.url) {
          const matchSegments = String(bestMatch.item.url).split("/").filter(Boolean);
          if (i >= matchSegments.length) {
            breadcrumbs.push({
              title: this.generateSegmentTitle(segment, previousSegment),
              href: isLastSegment ? undefined : currentPath,
              isCurrentPage: isLastSegment,
              isId,
            });
          }
        }
      } else if (!exactMatch) {
        // Generate automatic breadcrumb
        breadcrumbs.push({
          title: this.generateSegmentTitle(segment, previousSegment),
          href: isLastSegment ? undefined : currentPath,
          isCurrentPage: isLastSegment,
          isId,
        });
      }
    }

    return breadcrumbs;
  }

  private shouldAddBestMatch(currentPath: string, bestMatch: SidebarMatch): boolean {
    if (!("url" in bestMatch.item) || !bestMatch.item.url) return false;

    const matchUrl = String(bestMatch.item.url);
    return currentPath.startsWith(matchUrl) && currentPath !== matchUrl;
  }
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();

  return useMemo(() => {
    const generator = new BreadcrumbGenerator(sidebarData);
    return generator.generate(pathname);
  }, [pathname]);
}
