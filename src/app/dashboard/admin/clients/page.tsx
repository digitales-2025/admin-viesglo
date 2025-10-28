import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientsOverlays from "./_components/clients-overlays/ClientsOverlays";
import ClientsPrimaryButtons from "./_components/table/ClientsPrimaryButtons";
import ClientsTable from "./_components/table/ClientsTable";

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
      <ClientsOverlays />
    </>
  );
}
