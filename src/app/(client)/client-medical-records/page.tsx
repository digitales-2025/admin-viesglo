import { EnumAction, EnumResource } from "@/app/(admin)/roles/_utils/groupedPermission";
import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientMedicalRecordTable from "./_components/ClientMedicalRecordTable";

export default function PageMedicalRecords() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.occupationalHealth, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Registros Médicos" description="Gestione los registros médicos" />
      </ShellHeader>
      <ClientMedicalRecordTable />
    </ProtectedComponent>
  );
}
