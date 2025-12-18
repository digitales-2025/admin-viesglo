import { components } from "@/lib/api/types/api";

export type User = components["schemas"]["UserResponseDto"];

type Business = {
  name: string;
  logo: React.ElementType;
};

type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  permission?: string;
  roles?: string[];
  hideInSidebar?: boolean; // Si es true, no se muestra en sidebar pero sí en kbar
};

type NavLink = BaseNavItem & {
  url: string;
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: string })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

type NavGroup = {
  title: string;
  items: NavItem[];
  permission?: string;
  roles?: string[];
};

type SidebarData = {
  business: Business;
  navGroups: NavGroup[];
};

export type { NavCollapsible, NavGroup, NavItem, NavLink, SidebarData };
