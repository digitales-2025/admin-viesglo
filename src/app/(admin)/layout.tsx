import { AuthGuard } from "@/shared/components/auth/AuthGuard";
import AdminLayout from "@/shared/components/layout/AdminLayout";
import { NavBar } from "@/shared/components/layout/NavBar";
import Shell from "@/shared/components/layout/Shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <Shell>
        <AuthGuard>
          <div className="flex min-h-screen flex-col">
            <NavBar />
            <main className="flex-1">{children}</main>
          </div>
        </AuthGuard>
      </Shell>
    </AdminLayout>
  );
}
