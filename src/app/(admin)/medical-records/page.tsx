import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import MedicalRecordTable from "./_components/MedicalRecordTable";

export default function PageMedicalRecords() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Registros Médicos" description="Gestione los registros médicos" />
      </ShellHeader>
      <MedicalRecordTable />
    </>
  );
}
