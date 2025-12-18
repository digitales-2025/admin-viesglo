"use client";

import { Fragment, useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { useBreadcrumbs, useMediaQuery } from "@/shared/hooks";
import { cn } from "@/shared/lib/utils";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

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

  // Si necesita truncar, mostrar solo el primero, "..." y el último
  const firstItem = filteredItems[0];
  const lastItem = filteredItems[filteredItems.length - 1];

  return (
    <TooltipProvider>
      <Breadcrumb>
        <Tooltip>
          <TooltipTrigger asChild>
            <BreadcrumbList className="max-w-full cursor-help">
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

              {/* Ellipsis para items del medio */}
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
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
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-md">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Ruta completa:</p>
              <div className="flex flex-wrap items-center gap-1 text-sm">
                {filteredItems.map((item, index) => (
                  <Fragment key={`${item.title}-${index}`}>
                    {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                    {item.url ? (
                      <Link
                        href={item.url}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <span className={index === filteredItems.length - 1 ? "font-medium" : ""}>{item.title}</span>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </Breadcrumb>
    </TooltipProvider>
  );
}
