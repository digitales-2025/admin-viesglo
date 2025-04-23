import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ClientTable from "./_components/ClientTable";

export default function ProjectPage() {
  return (
    <Shell>
      <ShellHeader>
        <ShellTitle title="Registros médicos" />
      </ShellHeader>

      <p className="text-sm text-muted-foreground mb-4">
        Mira en tiempo real los trabajadores que han sido evaluados clínicamente.
      </p>

      <ClientTable />
    </Shell>
  );
}
