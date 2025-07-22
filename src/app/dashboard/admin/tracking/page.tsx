import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import { DownloadExcelProjectsButton } from "./_components/DownloadExcelProjectsButton";
import ProjectContainer from "./_components/ProjectContainer";

export default function TrackingPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Proyectos" description="Seguimiento de proyectos" />
        <DownloadExcelProjectsButton />
      </ShellHeader>
      <ProjectContainer />
    </>
  );
}
