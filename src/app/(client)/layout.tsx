import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  useUserTypeGuard(["client"]);
  return <div>{children}</div>;
}
