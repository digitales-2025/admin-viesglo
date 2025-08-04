"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavItem {
  title: string;
  icon: ReactNode;
  href: string;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
}

export default function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-4 py-6 bg-background/80 rounded-xl shadow-md border border-muted">
      <h2 className="mb-2 font-semibold tracking-tight text-primary/90">Configuración</h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link href={item.href} className="group relative block">
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "transition-transform duration-200",
                      isActive ? "scale-110" : "scale-100 group-hover:scale-105"
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate text-sm">{item.title}</span>
                  {/* Indicador animado de selección */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-primary transition-all" />
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
