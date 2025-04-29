import React from "react";

import { ProtectedComponent } from "@/auth/presentation/components/ProtectedComponent";
import AlertMessage from "@/shared/components/alerts/Alert";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { EnumAction, EnumResource } from "../roles/_utils/groupedPermission";
import CertificatesDataTable from "./_components/CertificatesDataTable";
import CertificatesDialogs from "./_components/CertificatesDialogs";
import CertificatesPrimaryButtons from "./_components/CertificatesPrimaryButtons";

export default function CertificatesPage() {
  return (
    <ProtectedComponent
      requiredPermissions={[{ resource: EnumResource.trainings, action: EnumAction.read }]}
      fallback={
        <AlertMessage
          variant="destructive"
          title="No tienes permisos para ver este contenido"
          description="Por favor, contacta al administrador. O intenta iniciar sesión con otro usuario."
        />
      }
    >
      <ShellHeader>
        <ShellTitle title="Certificación de capacitaciones" description="Gestiona los certificados de tus usuarios" />
        <CertificatesPrimaryButtons />
      </ShellHeader>
      <CertificatesDataTable />
      <CertificatesDialogs />
    </ProtectedComponent>
  );
}
