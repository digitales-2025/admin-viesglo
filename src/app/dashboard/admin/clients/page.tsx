import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import ClientsDialogs from "./_components/ClientsDialogs";
import ClientsPrimaryButtons from "./_components/ClientsPrimaryButtons";
import ClientsTable from "./_components/ClientsTable";

export default function PageClients() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.clients, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Clientes" description="Gestione los clientes" />
        <ClientsPrimaryButtons />
      </ShellHeader>
      <ClientsTable />
      <ClientsDialogs />
    </ProtectedComponent>
  );
}
