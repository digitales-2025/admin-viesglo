import AdminLayout from "@/presentation/components/layout/AdminLayout";

export default function Home() {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-5xl font-bold">Welcome to Admin</h1>
      </div>
    </AdminLayout>
  );
}
