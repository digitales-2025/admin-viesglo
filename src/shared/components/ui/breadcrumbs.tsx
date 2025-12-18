"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { useBreadcrumbs, useMediaQuery } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

export function Breadcrumbs() {
  const items = useBreadcrumbs();
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  // Filtrar items con título vacío
  const filteredItems = useMemo(() => items.filter((item) => item.title && item.title.trim() !== ""), [items]);

  // Determinar si necesitamos truncar basado en cantidad de items y tamaño de pantalla
  // En pantallas grandes (lg+), truncar si hay más de 4 items
  // En pantallas pequeñas, truncar si hay más de 3 items
  const shouldTruncate = filteredItems.length > (isLargeScreen ? 4 : 3);

  if (items.length === 0 || filteredItems.length === 0) return null;

  // Si no necesita truncar, mostrar todos los items
  if (!shouldTruncate) {
    return (
      <Breadcrumb>
        <BreadcrumbList className="max-w-full">
          {filteredItems.map((item, index) => {
            const isLast = index === filteredItems.length - 1;
            return (
              <Fragment key={`${item.title}-${index}`}>
                {!isLast ? (
                  <BreadcrumbItem>
                    {item.url ? (
                      <BreadcrumbLink asChild>
                        <Link
                          href={item.url}
                          className={cn("text-muted-foreground hover:text-foreground", "truncate block max-w-[150px]")}
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className={cn("text-muted-foreground truncate block max-w-[150px]")} title={item.title}>
                        {item.title}
                      </span>
                    )}
                  </BreadcrumbItem>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbPage className="truncate block max-w-[150px]" title={item.title}>
                      {item.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                )}
                {!isLast && (
                  <BreadcrumbSeparator className="shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // Si necesita truncar, mostrar el primero, un dropdown con los del medio, y el último
  const firstItem = filteredItems[0];
  const lastItem = filteredItems[filteredItems.length - 1];
  const middleItems = filteredItems.slice(1, -1);

  return (
    <Breadcrumb>
      <BreadcrumbList className="max-w-full">
        {/* Primer item */}
        <BreadcrumbItem>
          {firstItem.url ? (
            <BreadcrumbLink asChild>
              <Link
                href={firstItem.url}
                className={cn("text-muted-foreground hover:text-foreground", "truncate block max-w-[150px]")}
                title={firstItem.title}
              >
                {firstItem.title}
              </Link>
            </BreadcrumbLink>
          ) : (
            <span className={cn("text-muted-foreground truncate block max-w-[150px]")} title={firstItem.title}>
              {firstItem.title}
            </span>
          )}
        </BreadcrumbItem>

        <BreadcrumbSeparator className="shrink-0">
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        {/* Dropdown con items del medio */}
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex items-center justify-center rounded-md p-1",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                )}
                aria-label="Mostrar más items del breadcrumb"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] max-w-[300px]">
              {middleItems.map((item, index) => {
                const isDisabled = !item.url;
                return (
                  <DropdownMenuItem
                    key={`${item.title}-${index}`}
                    disabled={isDisabled}
                    className={cn(isDisabled && "opacity-60 cursor-not-allowed")}
                    asChild={!isDisabled}
                  >
                    {item.url ? (
                      <Link
                        href={item.url}
                        className="flex items-center gap-2 w-full cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    ) : (
                      <div
                        className="flex items-center gap-2 w-full cursor-not-allowed"
                        title="Esta ruta no está disponible"
                      >
                        <ChevronRight className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                        <span className="truncate text-muted-foreground/70">{item.title}</span>
                      </div>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="shrink-0">
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        {/* Último item */}
        <BreadcrumbItem>
          <BreadcrumbPage className="truncate block max-w-[150px]" title={lastItem.title}>
            {lastItem.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
