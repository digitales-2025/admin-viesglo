import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientMedicalRecordTable from "./_components/ClientMedicalRecordTable";

export default function PageMedicalRecords() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Registros Médicos"
          description="Gestione los registros médicos de las empresas que tiene contratadas"
        />
      </ShellHeader>
      <ClientMedicalRecordTable />
    </>
  );
}
