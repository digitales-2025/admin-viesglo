import { Metadata } from "next";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import UsersDialogs from "./_components/UsersDialogs";
import UsersPrimaryButtons from "./_components/UsersPrimaryButtons";
import UsersTable from "./_components/UsersTable";

export const metadata: Metadata = {
  title: "Administrador de usuarios",
};

export default function UsersPage() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.users, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Administrador de usuarios" description="Gestiona los usuarios aquí." />
        <UsersPrimaryButtons />
      </ShellHeader>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <UsersTable />
        <UsersDialogs />
      </div>
    </ProtectedComponent>
  );
}
