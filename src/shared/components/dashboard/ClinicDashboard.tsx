"use client";

import ClinicDashboardLayout from "@/app/(clinic)/layout";
import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";

export default function ClinicDashboard() {
  return (
    <ClinicDashboardLayout>
      <Shell>
        <ShellHeader>
          <ShellTitle title="Clinic Dashboard" />
        </ShellHeader>
      </Shell>
      Información de la clínica
    </ClinicDashboardLayout>
  );
}
