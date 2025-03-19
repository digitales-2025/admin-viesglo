import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ProyectsContainer from "./_components/ProyectsContainer";

export default function TrackingPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Proyectos" description="Seguimiento de proyectos" />
      </ShellHeader>
      <ProyectsContainer />
    </>
  );
}
