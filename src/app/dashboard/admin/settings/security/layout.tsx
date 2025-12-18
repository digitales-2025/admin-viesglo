import type { ReactNode } from "react";
import { Lock, User } from "lucide-react";

import { Main } from "@/shared/components/layout/Main";
import { Separator } from "@/shared/components/ui/separator";
import { SettingsBreadcrumbOverride } from "../_components/SettingsBreadcrumbOverride";
import SidebarNav from "../_components/SidebarNav";

export default function AdminSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SettingsBreadcrumbOverride />
      <Main fixed className="my-0 py-0 min-h-screen">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Protección y Acceso</h1>
          <p className="text-muted-foreground">Administra el acceso y refuerza la protección de tu cuenta personal.</p>
        </div>
        <Separator className="my-4 lg:my-6" />
        <div className="flex flex-1 flex-col lg:flex-row px-2 lg:px-0 gap-0 lg:gap-8">
          {/* Contenido principal */}
          <section className="w-full bg-white/90 dark:bg-background/80 rounded-xl py-6 border px-6 flex flex-col justify-center">
            {children}
          </section>
          {/* Separador vertical */}
          <div className="hidden lg:block w-px mx-4 bg-border rounded-full" />
          {/* Sidebar */}
          <aside className="top-0 lg:sticky lg:w-72 flex-shrink-0">
            <SidebarNav items={sidebarNavItems} />
          </aside>
        </div>
      </Main>
    </>
  );
}

const sidebarNavItems = [
  {
    title: "Perfil",
    icon: <User className="h-4 w-4" />,
    href: "/dashboard/admin/settings/profile",
  },
  {
    title: "Seguridad",
    icon: <Lock className="h-4 w-4 " />,
    href: "/dashboard/admin/settings/security",
  },
];
