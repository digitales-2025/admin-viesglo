import { LinkProps } from "next/link";

import { EnumPermission, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
import { components } from "@/lib/api/types/api";

export type User = components["schemas"]["UserResponseDto"];

interface BaseNavItem {
  title: string;
  badge?: string;
  icon?: React.ElementType;
  permissions?: Permission[];
}

type NavLink = BaseNavItem & {
  url: LinkProps["href"];
  items?: never;
  permissions?: Permission[];
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps["href"] })[];
  url?: never;
  permissions?: Permission[];
};

type Permission = {
  resource: EnumResource;
  action: EnumPermission;
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
