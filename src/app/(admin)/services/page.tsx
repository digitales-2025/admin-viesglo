import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import ContainerServices from "./_components/ContainerServices";

export default function PageServices() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.services, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Servicios" description="Gestiona los servicios aquí." />
      </ShellHeader>
      <ContainerServices />
    </ProtectedComponent>
  );
}
