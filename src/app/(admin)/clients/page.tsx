import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientsDialogs from "./_components/ClientsDialogs";
import ClientsPrimaryButtons from "./_components/ClientsPrimaryButtons";
import ClientsTable from "./_components/ClientsTable";

export default function PageClients() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Clientes" description="Gestione los clientes" />
        <ClientsPrimaryButtons />
      </ShellHeader>
      <ClientsTable />
      <ClientsDialogs />
    </>
  );
}
