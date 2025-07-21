import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientsDialogs from "./_components/ClientsDialogs";
import ClientsPrimaryButtons from "./_components/ClientsPrimaryButtons";
import ClientsTable from "./_components/ClientsTable";

export default function PageClients() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Gestión de Clientes"
          description="Administre, registre y consulte la información de sus clientes desde este panel."
        />
        <ClientsPrimaryButtons />
      </ShellHeader>
      <ClientsTable />
      <ClientsDialogs />
    </>
  );
}
