"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">404</h1>
        <span className="font-medium">¡Ups! Página no encontrada!</span>
        <p className="text-center text-muted-foreground">
          No se encontró la página que buscas <br />o podría haber sido eliminada.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft />
            Atras
          </Button>
          <Button onClick={() => router.push("/")}>
            <Home />
            Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
