import { Metadata } from "next";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import DiagnosticsDialogs from "./_components/DiagnosticsDialogs";
import DiagnosticsPrimaryButtons from "./_components/DiagnosticsPrimaryButtons";
import DiagnosticsTable from "./_components/DiagnosticsTable";

export const metadata: Metadata = {
  title: "Administrador de diagnósticos",
};

export default function DiagnosticsPage() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.diagnostic, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Diagnósticos" description="Gestiona los diagnósticos aquí." />
        <DiagnosticsPrimaryButtons />
      </ShellHeader>
      <DiagnosticsTable />
      <DiagnosticsDialogs />
    </ProtectedComponent>
  );
}
