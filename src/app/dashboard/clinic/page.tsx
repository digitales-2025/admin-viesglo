import ClinicDashboard from "@/shared/components/dashboard/ClinicDashboard";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";

export default function ClinicPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Panel de Control de la Clínica"
          description="Vista general del rendimiento empresarial en tiempo real"
        />
      </ShellHeader>
      <ClinicDashboard />
    </>
  );
}
