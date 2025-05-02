import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ProjectStatusContainer from "./_components/project-statusContainer";

export default function ProjectPage() {
  return (
    <>
      <Shell>
        <ShellHeader>
          <ShellTitle title="Seguimiento del proyecto" />
        </ShellHeader>
        Estamos comprometidos con la transparencia en todos nuestros proyectos.
      </Shell>
      <ProjectStatusContainer />
    </>
  );
}
