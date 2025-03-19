import AdminLayout from "@/shared/components/layout/AdminLayout";
import { Shell } from "@/shared/components/layout/Shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <Shell>{children}</Shell>
    </AdminLayout>
  );
}
