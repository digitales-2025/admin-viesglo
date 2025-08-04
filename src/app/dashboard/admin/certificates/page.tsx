import React from "react";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import CertificatesDataTable from "./_components/CertificatesDataTable";
import CertificatesDialogs from "./_components/CertificatesDialogs";
import CertificatesPrimaryButtons from "./_components/CertificatesPrimaryButtons";

export default function CertificatesPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Certificación de capacitaciones" description="Gestiona los certificados de tus usuarios" />
        <CertificatesPrimaryButtons />
      </ShellHeader>
      <CertificatesDataTable />
      <CertificatesDialogs />
    </>
  );
}
