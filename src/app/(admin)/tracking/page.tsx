import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import ProjectContainer from "./_components/ProjectContainer";

export default function TrackingPage() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.projects, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Proyectos" description="Seguimiento de proyectos" />
      </ShellHeader>
      <ProjectContainer />
    </ProtectedComponent>
  );
}
