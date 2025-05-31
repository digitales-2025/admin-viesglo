import { Metadata } from "next";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import ClinicsDialogs from "./_components/ClinicsDialogs";
import ClinicsPrimaryButtons from "./_components/ClinicsPrimaryButtons";
import ClinicsTable from "./_components/ClinicsTable";

export const metadata: Metadata = {
  title: "Administrador de clínicas",
};

export default function ClinicsPage() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.clinics, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Clínicas" description="Gestiona las clínicas aquí." />
        <ClinicsPrimaryButtons />
      </ShellHeader>
      <ClinicsTable />
      <ClinicsDialogs />
    </ProtectedComponent>
  );
}
