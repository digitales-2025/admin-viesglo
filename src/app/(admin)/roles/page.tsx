import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p>Bienvenido al panel de administración de MS & M Consulting.</p>
    </div>
  );
}
