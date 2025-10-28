"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CornerDownRight, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

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
import { ScrollArea } from "./scroll-area";

export function CommandMenu() {
  const navigate = useRouter();
  const { setTheme } = useTheme();
  const { open, setOpen } = useSearch();

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
          {sidebarData?.navGroups.map((group) => (
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
