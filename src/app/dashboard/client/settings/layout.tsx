import { ReactNode } from "react";
import { Lock, User } from "lucide-react";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { Separator } from "@/shared/components/ui/separator";
import SidebarNav from "./_components/SidebarNav";

export default function layout({ children }: { children: ReactNode }) {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Configuración" description="Configura tu información y la seguridad de tu cuenta." />
      </ShellHeader>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="top-0 lg:sticky lg:w-1/5">
          <SidebarNav items={clientSidebarNavItems} />
        </aside>
        <div className="flex w-full overflow-y-hidden p-1 pr-4">{children}</div>
      </div>
    </>
  );
}

const clientSidebarNavItems = [
  {
    title: "Perfil",
    icon: <User size={18} />,
    href: "/dashboard/client/settings",
  },
  {
    title: "Seguridad",
    icon: <Lock size={18} />,
    href: "/dashboard/client/settings/security",
  },
];
