import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";
import ContainerServices from "./_components/ContainerServices";

export default function PageServices() {
  return (
    <>
      <ShellHeader>
        <ShellTitle title="Servicios" description="Gestiona los servicios aquí." />
      </ShellHeader>
      <ContainerServices />
    </>
  );
}
