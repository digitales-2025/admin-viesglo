"use client";

import React from "react";

import { LoadingTransition } from "@/shared/components/ui/loading-transition";
import { useAuthLoading } from "@/shared/hooks/use-auth-loading";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoading, message } = useAuthLoading();

  // Este layout es para la página de inicio de sesión
  return (
    <main>
      <LoadingTransition show={isLoading} message={message} />
      {children}
    </main>
  );
}
