"use client";

import ClientDashboardLayout from "@/app/(client)/layout";
import { Shell, ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";

export default function ClientDashboard() {
  return (
    <ClientDashboardLayout>
      <Shell>
        <ShellHeader>
          <ShellTitle title="Client Dashboard" />
        </ShellHeader>
      </Shell>
      Dashboard de cliente
    </ClientDashboardLayout>
  );
}
