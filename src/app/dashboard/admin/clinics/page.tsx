import { Metadata } from "next";

import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClinicsDialogs from "./_components/ClinicsDialogs";
import ClinicsPrimaryButtons from "./_components/ClinicsPrimaryButtons";
import ClinicsTable from "./_components/ClinicsTable";

export const metadata: Metadata = {
  title: "Administrador de clínicas",
};

export default function ClinicsPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Clínicas" description="Gestiona las clínicas aquí." />
        <ClinicsPrimaryButtons />
      </ShellHeader>
      <ClinicsTable />
      <ClinicsDialogs />
    </>
  );
}
