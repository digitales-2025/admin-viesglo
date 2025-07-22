"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useProfile } from "@/app/(public)/auth/sign-in/_hooks/use-auth";
import { Skeleton } from "../ui/skeleton";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { data: user, isLoading, error } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && error) {
      router.push("/sign-in");
    }
  }, [user, isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-end">
        <Skeleton className="size-8 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}
