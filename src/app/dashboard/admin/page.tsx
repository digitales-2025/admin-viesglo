import AdminDashboard from "@/shared/components/dashboard/AdminDashboard";
import { ShellHeader, ShellTitle } from "@/shared/components/layout/Shell";

export default function AdminPage() {
  return (
    <>
      <ShellHeader>
        <ShellTitle
          title="Panel Ejecutivo - MS&M Consulting"
          description="Vista general del rendimiento empresarial en tiempo real"
        />
      </ShellHeader>
      <AdminDashboard />
    </>
  );
}
