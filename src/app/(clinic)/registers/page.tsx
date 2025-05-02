import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import RegistersDialogs from "./_components/RegistersDialogs";
import RegistersPrimaryButtons from "./_components/RegistersPrimaryButtons";
import RegistersTable from "./_components/RegistersTable";

export default function RegistersPage() {
  return (
    <Shell>
      <ShellHeader>
        <ShellTitle title="Registros Médicos" description="Gestione los registros médicos de la clínica" />
        <RegistersPrimaryButtons />
      </ShellHeader>
      <RegistersTable />
      <RegistersDialogs />
    </Shell>
  );
}
