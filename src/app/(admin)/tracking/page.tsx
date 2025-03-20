import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ProjectContainer from "./_components/ProjectContainer";

export default function TrackingPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Proyectos" description="Seguimiento de proyectos" />
      </ShellHeader>
      <ProjectContainer />
    </>
  );
}
