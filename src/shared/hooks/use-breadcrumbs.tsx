import { useMemo } from "react";
import { usePathname } from "next/navigation";

import { sidebarData } from "../components/layout/data/sidebar-data";
import { BreadcrumbOverride, useBreadcrumbStore } from "../context/stores/breadcrumb-store";

type BreadcrumbItemType = {
  title: string;
  url?: string;
  isCurrent?: boolean;
};

type UseBreadcrumbsOptions = {
  isDynamic?: (segment: string, index: number, fullPath: string) => boolean;
  dynamicLabel?: string | ((segment: string, index: number, fullPath: string) => string);
  homeLabel?: string;
};

type SidebarItem = {
  title: string;
  url?: string;
  items?: SidebarItem[];
};

type NavGroup = {
  title: string;
  items: SidebarItem[];
};

function buildIndexes(navGroups: NavGroup[]) {
  const exactPathToTitle = new Map<string, string>();

  const walk = (items: SidebarItem[]) => {
    for (const it of items) {
      if (it.url) exactPathToTitle.set(it.url, it.title);
      if (it.items) walk(it.items);
    }
  };

  for (const group of navGroups) walk(group.items);

  return { exactPathToTitle };
}

function formatSegment(segment: string) {
  return segment
    .replace(/^\[|\]$/g, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function matchesPattern(path: string, pattern: string): boolean {
  const pathSegments = path.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);
  if (pathSegments.length !== patternSegments.length) return false;
  return patternSegments.every((patternSegment, index) => {
    const pathSegment = pathSegments[index];
    if (patternSegment.startsWith("[") && patternSegment.endsWith("]")) return true;
    return pathSegment === patternSegment;
  });
}

function applyBreadcrumbOverride(items: BreadcrumbItemType[], override: BreadcrumbOverride): BreadcrumbItemType[] {
  switch (override.type) {
    case "replace-all":
      return [
        {
          title: override.label,
          url: undefined,
          isCurrent: true,
        },
      ];
    case "replace-segment": {
      if (override.segmentIndex === undefined || override.segmentIndex >= items.length) return items;
      const newItems = [...items];
      const updatedItem = {
        ...newItems[override.segmentIndex],
        title: override.label,
      };
      // Si hay customUrl, usarlo; si no, y hay removeUrl, quitar la URL; si no, mantener la URL original
      if (override.customUrl) {
        updatedItem.url = override.customUrl;
      } else if (override.removeUrl) {
        updatedItem.url = undefined;
      }
      newItems[override.segmentIndex] = updatedItem;
      return newItems;
    }
    case "replace-from-segment": {
      if (override.fromSegmentIndex === undefined || override.fromSegmentIndex >= items.length) return items;
      const beforeItems = items.slice(0, override.fromSegmentIndex);
      return [
        ...beforeItems,
        {
          title: override.label,
          url: undefined,
          isCurrent: true,
        },
      ];
    }
    default:
      return items;
  }
}

export function useBreadcrumbs({
  isDynamic,
  dynamicLabel,
  homeLabel = "Dashboard",
}: UseBreadcrumbsOptions = {}): BreadcrumbItemType[] {
  const pathname = usePathname();
  const breadcrumbOverrides = useBreadcrumbStore((state) => state.overrides);

  const { exactPathToTitle } = useMemo(() => buildIndexes(sidebarData.navGroups as NavGroup[]), []);

  const breadcrumbItems = useMemo(() => {
    if (pathname === "/") {
      return [
        {
          title: homeLabel,
          url: "/",
          isCurrent: true,
        },
      ];
    }

    const pathSegments = pathname.split("/").filter(Boolean);

    const items: BreadcrumbItemType[] = [];

    pathSegments.forEach((segment, index) => {
      // Ignorar el segmento "admin" que está después de "dashboard"
      if (segment === "admin" && index === 1 && pathSegments[0] === "dashboard") {
        return; // No agregar este item al breadcrumb
      }

      const currentPath = `/${pathSegments.slice(0, index + 1).join("/")}`;
      const isLast = index === pathSegments.length - 1;

      const dynamic = isDynamic?.(segment, index, currentPath) ?? false;

      let title: string | undefined;

      if (!dynamic) {
        title = exactPathToTitle.get(currentPath);
      }

      if (!title) {
        if (dynamic && typeof dynamicLabel === "string") {
          title = dynamicLabel;
        } else if (dynamic && typeof dynamicLabel === "function") {
          title = dynamicLabel(segment, index, currentPath);
        } else {
          title = formatSegment(segment);
        }
      }

      items.push({
        title,
        url: isLast ? undefined : currentPath,
        isCurrent: isLast,
      });
    });

    return items;
  }, [pathname, exactPathToTitle, isDynamic, dynamicLabel, homeLabel]);

  const finalBreadcrumbItems = useMemo(() => {
    const matchingOverrides = breadcrumbOverrides.filter((override) => matchesPattern(pathname, override.pattern));

    if (matchingOverrides.length > 0) {
      // Aplicar todos los overrides que coincidan, uno por uno
      let result = breadcrumbItems;
      for (const override of matchingOverrides) {
        result = applyBreadcrumbOverride(result, override);
      }
      return result;
    }

    return breadcrumbItems;
  }, [breadcrumbItems, breadcrumbOverrides, pathname]);

  return finalBreadcrumbItems;
}
