"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";

interface BackButtonProps {
  href: string;
  hasUnsavedChanges?: boolean;
}

export function BackButton({ href, hasUnsavedChanges: initialHasUnsavedChanges = false }: BackButtonProps) {
  const router = useRouter();
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(initialHasUnsavedChanges);
  const [isNavigating, setIsNavigating] = useState(false);

  // Prefetch the destination page to improve navigation speed
  useEffect(() => {
    router.prefetch(href);
  }, [href, router]);

  // Escuchar el evento de cambios sin guardar
  useEffect(() => {
    const handleUnsavedChanges = (e: Event) => {
      const customEvent = e as CustomEvent;
      setHasUnsavedChanges(customEvent.detail?.hasUnsavedChanges || false);
    };

    window.addEventListener("unsavedChanges", handleUnsavedChanges);

    return () => {
      window.removeEventListener("unsavedChanges", handleUnsavedChanges);
    };
  }, []);

  const handleNavigate = () => {
    setIsNavigating(true);
    // Use a short timeout to allow the UI to update before navigation
    setTimeout(() => {
      router.push(href);
    }, 10);
  };

  const handleClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true);
    } else {
      handleNavigate();
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        type="button"
        disabled={isNavigating}
        aria-label="Volver"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar en el formulario. Si sales ahora, perderás todos los cambios realizados.
              <span className="mt-2 font-medium">¿Qué deseas hacer?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex items-center gap-2">
            <AlertDialogCancel onClick={() => setShowUnsavedChangesDialog(false)}>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleNavigate} className="bg-red-600 text-white hover:bg-red-700">
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
