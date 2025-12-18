import { EnumAction, EnumResource } from "@/app/dashboard/admin/settings/_types/roles.types";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { PermissionProtected } from "@/shared/components/protected-component";
import { NoInfoSection } from "@/shared/components/ui/noinfosection";
import ClientsOverlays from "./_components/clients-overlays/ClientsOverlays";
import { ClientsBreadcrumbOverride } from "./_components/ClientsBreadcrumbOverride";
import ClientsPrimaryButtons from "./_components/table/ClientsPrimaryButtons";
import ClientsTable from "./_components/table/ClientsTable";

export default function PageClients() {
  return (
    <PermissionProtected
      permissions={[{ resource: EnumResource.clients, action: EnumAction.read }]}
      requireAll={false}
      fallback={<NoInfoSection message="No tienes permisos para ver los clientes." />}
    >
      <ClientsBreadcrumbOverride />
      <ShellHeader>
        <ShellTitle
          title="Gestión de Clientes"
          description="Administre, registre y consulte la información de sus clientes desde este panel."
        />
        <ClientsPrimaryButtons />
      </ShellHeader>
      <ClientsTable />
      <ClientsOverlays />
    </PermissionProtected>
  );
}
