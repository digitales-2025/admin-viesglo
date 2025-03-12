"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/app/(auth)/sign-in/_hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: user, isLoading, error } = useCurrentUser();
  console.log("🚀 ~ AuthGuard ~ user:", user);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && error) {
      router.push("/sign-in");
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}
