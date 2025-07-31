import { Metadata } from "next";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import UsersPrimaryButtons from "./_components/table/UsersPrimaryButtons";
import UsersTable from "./_components/table/UsersTable";
import UsersOverlays from "./_components/users-overlays/UsersOverlays";

export const metadata: Metadata = {
  title: "Administrador de usuarios",
};

export default function UsersPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Gestión de usuarios"
          description="Administra, crea, edita y controla el acceso de los usuarios de la plataforma desde este panel centralizado."
        />
        <UsersPrimaryButtons />
      </ShellHeader>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <UsersTable />
        <UsersOverlays />
      </div>
    </>
  );
}
