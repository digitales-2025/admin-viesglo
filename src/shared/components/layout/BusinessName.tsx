"use client";

import * as React from "react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/shared/components/ui/sidebar";

type BusinessNameProps = {
  businessData: {
    name: string;
    logo: React.ElementType;
  };
};

export function BusinessName({ businessData: { name, logo: Logo } }: BusinessNameProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="group h-full">
          <div className="size-10 group-data-[collapsible=icon]:size-8 flex items-center justify-center border rounded-md border-card bg-card transition-all duration-200 ease-in-out">
            <Logo className="shrink-0 [&svg]:size-8 group-data-[collapsible=icon]:[&svg]:size-6 group-hover:[&svg]:scale-105 transition-all duration-300 ease-in-out" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="truncate font-semibold group-hover:text-primary transition-all duration-300 ease-in-out text-[16px]">
              {name}
            </span>
            <span className="text-[13px] text-muted-foreground">Empresa</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
