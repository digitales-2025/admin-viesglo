"use client";

import type React from "react";
import Link from "next/link";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useBreadcrumbs } from "@/shared/hooks/use-breadcrumbs";

interface AutoBreadcrumbProps {
  maxItems?: number;
  showIcons?: boolean;
  className?: string;
}

interface BreadcrumbItemType {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
  icon?: React.ElementType;
  isId?: boolean;
}

export function AutoBreadcrumb({ maxItems = 4, showIcons = true, className }: AutoBreadcrumbProps) {
  const breadcrumbs = useBreadcrumbs();

  // Show only home icon if we're at root or have minimal breadcrumbs
  if (breadcrumbs.length <= 1) {
    return (
      <div className={cn("flex items-center text-sm text-muted-foreground", className)}>
        <Home className="h-4 w-4" />
        {breadcrumbs[0]?.isCurrentPage && (
          <span className="ml-2 font-medium text-foreground">{breadcrumbs[0].title}</span>
        )}
      </div>
    );
  }

  // Handle overflow with dropdown
  const shouldCollapse = breadcrumbs.length > maxItems;
  const visibleBreadcrumbs = shouldCollapse ? [breadcrumbs[0], ...breadcrumbs.slice(-(maxItems - 2))] : breadcrumbs;
  const hiddenBreadcrumbs = shouldCollapse ? breadcrumbs.slice(1, -(maxItems - 2)) : [];

  const renderBreadcrumbItem = (item: BreadcrumbItemType, index: number, isVisible = true) => {
    const IconComponent = item.icon;
    const isHome = index === 0;
    const showIcon = showIcons && (IconComponent || isHome);

    return (
      <BreadcrumbItem key={`${item.title}-${index}`} className={cn(!isVisible && "hidden")}>
        {item.isCurrentPage ? (
          <BreadcrumbPage className="flex items-center text-sm font-medium text-foreground max-w-[150px]">
            {showIcon && (
              <>
                {isHome ? (
                  <Home className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                ) : IconComponent ? (
                  <IconComponent className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                ) : null}
              </>
            )}
            <span className={cn("truncate", item.isId && "font-mono text-xs")}>{item.title}</span>
          </BreadcrumbPage>
        ) : item.href ? (
          <BreadcrumbLink asChild>
            <Link
              href={item.href}
              className="flex items-center text-sm hover:text-foreground transition-colors max-w-[120px] group"
            >
              {showIcon && (
                <>
                  {isHome ? (
                    <Home className="mr-2 h-3.5 w-3.5 flex-shrink-0 group-hover:text-foreground" />
                  ) : IconComponent ? (
                    <IconComponent className="mr-2 h-3.5 w-3.5 flex-shrink-0 group-hover:text-foreground" />
                  ) : null}
                </>
              )}
              <span className={cn("truncate", item.isId && "font-mono text-xs")}>{item.title}</span>
            </Link>
          </BreadcrumbLink>
        ) : (
          <span className="flex items-center text-sm text-muted-foreground max-w-[120px]">
            {showIcon && (
              <>
                {isHome ? (
                  <Home className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                ) : IconComponent ? (
                  <IconComponent className="mr-2 h-3.5 w-3.5 flex-shrink-0" />
                ) : null}
              </>
            )}
            <span className={cn("truncate", item.isId && "font-mono text-xs")}>{item.title}</span>
          </span>
        )}
      </BreadcrumbItem>
    );
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList className="flex-nowrap">
        {/* First item (always visible) */}
        {renderBreadcrumbItem(visibleBreadcrumbs[0], 0)}

        {/* Separator after first item */}
        {visibleBreadcrumbs.length > 1 && (
          <BreadcrumbSeparator className="mx-1">
            <ChevronRight className="h-3.5 w-3.5" />
          </BreadcrumbSeparator>
        )}

        {/* Collapsed items dropdown */}
        {shouldCollapse && hiddenBreadcrumbs.length > 0 && (
          <>
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                    aria-label={`Show ${hiddenBreadcrumbs.length} hidden breadcrumbs`}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {hiddenBreadcrumbs.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <DropdownMenuItem key={`hidden-${item.title}-${index}`} asChild>
                        {item.href ? (
                          <Link href={item.href} className="flex items-center">
                            {showIcons && IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                            <span className="truncate">{item.title}</span>
                          </Link>
                        ) : (
                          <div className="flex items-center">
                            {showIcons && IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                            <span className="truncate">{item.title}</span>
                          </div>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="mx-1">
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>
          </>
        )}

        {/* Remaining visible items */}
        {visibleBreadcrumbs.slice(1).map((item, index) => (
          <div key={`visible-${item.title}-${index + 1}`} className="flex items-center">
            {renderBreadcrumbItem(item, index + 1)}
            {index < visibleBreadcrumbs.length - 2 && (
              <BreadcrumbSeparator className="mx-1">
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
