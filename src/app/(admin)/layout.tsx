import AdminLayout from "@/shared/components/layout/AdminLayout";

export default function layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminLayout>{children}</AdminLayout>;
}