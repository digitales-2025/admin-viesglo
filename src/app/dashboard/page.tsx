"use client";

import { redirect } from "next/navigation";

import { useUserTypeGuard } from "@/auth/presentation/hooks/useUserTypeGuard";

export default function DashboardPage() {
  const { user } = useUserTypeGuard(["admin", "clinic", "client"]);

  if (user?.type === "admin") redirect("/dashboard/admin");
  if (user?.type === "clinic") redirect("/dashboard/clinic");
  if (user?.type === "client") redirect("/dashboard/client");

  return null;
}
