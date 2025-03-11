"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos
            refetchOnWindowFocus: process.env.NODE_ENV === "production",
            retry: (failureCount, error: any) => {
              // No reintentar cuando la sesión ha expirado (ya manejado por el cliente HTTP)
              if (
                error?.message === "La sesión ha expirado" ||
                error?.message === "Session expired" ||
                (error?.data && error?.status === 401)
              ) {
                return false;
              }
              // Solo un reintento para otros errores
              return failureCount < 1;
            },
          },
          mutations: {
            // No reintentar mutaciones fallidas
            retry: false,
            // Manejar errores de autenticación globalmente
            onError: (error: any) => {
              // Los errores 401 ya se manejan en el cliente HTTP
              // Este es un manejo adicional si es necesario
              console.error("Mutation error:", error);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
