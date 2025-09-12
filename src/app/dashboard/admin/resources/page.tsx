import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ResourcesOverlays from "./_components/resources-overlays/ResourcesOverlays";
import ResourcePrimaryButtons from "./_components/table/ResourcePrimaryButtons";
import ResourcesTable from "./_components/table/ResourcesTable";

export default function PageResources() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Gestión de Recursos" description="Gestione los recursos para los proyectos." />
        <ResourcePrimaryButtons />
      </ShellHeader>
      <ResourcesTable />
      <ResourcesOverlays />
    </>
  );
}
