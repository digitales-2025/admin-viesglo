import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ProjectTemplatesTable from "./_components/table/ProjectTemplatesTable";
import ProjectTemplatesPrimaryButtons from "./_components/table/TemplatesPrimaryButtons";
import ProjectTemplatesOverlays from "./_components/templates-overlays/ProjectTemplatesOverlays";

export default function TemplatesPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Gestión de Plantillas"
          description="Administre, registre y consulte la información de sus plantillas desde este panel."
        />
        <ProjectTemplatesPrimaryButtons />
      </ShellHeader>
      <ProjectTemplatesTable />
      <ProjectTemplatesOverlays />
    </>
  );
}
