import { ReactNode } from "react";
import { Lock, User } from "lucide-react";

import { Main } from "@/shared/components/layout/Main";
import { Separator } from "@/shared/components/ui/separator";
import SidebarNav from "./_components/SidebarNav";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <Main fixed>
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configuración</h1>
        <p className="text-muted-foreground">Configura tu información y la seguridad de tu cuenta.</p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex w-full overflow-y-hidden p-1 pr-4">{children}</div>
      </div>
    </Main>
  );
}

const sidebarNavItems = [
  {
    title: "Perfil",
    icon: <User size={18} />,
    href: "/settings",
  },
  {
    title: "Seguridad",
    icon: <Lock size={18} />,
    href: "/settings/security",
  },
];
