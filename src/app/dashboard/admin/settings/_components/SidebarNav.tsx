"use client";

import { JSX, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { buttonVariants } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    title: string;
    href: string;
    icon: JSX.Element;
  }[];
}

export default function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [val, setVal] = useState(pathname ?? "/dashboard/admin/settings");

  const handleSelect = (href: string) => {
    setVal(href);
    router.push(href);
  };

  return (
    <>
      <div className="p-1 md:hidden">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea type="always" className="hidden w-full min-w-40 bg-background px-1 py-2 md:block">
        <nav className={cn("flex space-x-2 py-1 lg:flex-col lg:space-x-0 lg:space-y-1", className)} {...props}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                "justify-start"
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </>
  );
}
