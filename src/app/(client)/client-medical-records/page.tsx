import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientMedicalRecordTable from "./_components/ClientMedicalRecordTable";

export default function PageMedicalRecords() {
  return (
    <Shell>
      <ShellHeader>
        <ShellTitle
          title="Registros Médicos"
          description="Gestione los registros médicos de las empresas que tiene contratadas"
        />
      </ShellHeader>
      <ClientMedicalRecordTable />
    </Shell>
  );
}
