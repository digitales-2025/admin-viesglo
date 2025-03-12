import { LinkProps } from "next/link";

import { components } from "@/lib/api/types/api";

export type User = components["schemas"]["UserResponseDto"];

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
}

type NavLink = BaseNavItem & {
  url: LinkProps["href"];
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps["href"] })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface SidebarData {
  navGroups: NavGroup[];
}

export type { NavCollapsible, NavGroup, NavItem, NavLink, SidebarData };
