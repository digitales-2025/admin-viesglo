"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Hammer, HardHat, Home, Wrench } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="h-svh bg-primary/80  dark:bg-primary/80 ">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-6 p-4">
        {/* Construction Icons Animation */}
        <div className="relative mb-4">
          <div className="flex items-center gap-4 text-white">
            <HardHat className="h-16 w-16 animate-bounce" style={{ animationDelay: "0s" }} />
            <Wrench className="h-12 w-12 animate-bounce" style={{ animationDelay: "0.2s" }} />
            <Hammer className="h-14 w-14 animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        <Card className="max-w-md w-full border-secondary shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-orange-600">🚧</h1>
              <h2 className="text-2xl font-bold text-foreground">¡Estamos trabajando!</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20  rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                En construcción
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground font-medium">Esta página está siendo construida</p>
              <p className="text-sm text-muted-foreground">
                Nuestro equipo de desarrolladores está trabajando para completar la página. ¡Vuelve pronto para ver las
                novedades!
              </p>
            </div>

            {/* Progress Bar Animation */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-primary/80 h-2 rounded-full animate-pulse" style={{ width: "67%" }}></div>
            </div>
            <p className="text-xs text-gray-400">Progreso: 67% completado</p>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-4">
          <Button variant="outline" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </Button>
          <Button variant={"secondary"} onClick={() => router.push("/")} className="gap-2">
            <Home className="h-4 w-4" />
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
