import { Metadata } from "next";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import RolesDialogs from "./_components/RolesDialogs";
import { RolesExpandableTable } from "./_components/RolesExpandableTable";
import RolesPrimaryButtons from "./_components/RolesPrimaryButtons";
import { EnumAction, EnumResource } from "./_utils/groupedPermission";

export const metadata: Metadata = {
  title: "Administrador de roles",
};

export default function RolesPage() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.roles, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Administrador de roles</h2>
          <p className="text-muted-foreground">Gestiona los roles de los usuarios aquí.</p>
        </div>
        <RolesPrimaryButtons />
      </div>
      <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
        <RolesExpandableTable />
      </div>
      <RolesDialogs />
    </ProtectedComponent>
  );
}
