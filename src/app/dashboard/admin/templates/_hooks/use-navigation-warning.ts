"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useDialogStore } from "@/shared/stores/useDialogStore";

interface UseNavigationWarningProps {
  hasUnsavedChanges: () => boolean;
  templateId?: string;
  isUpdate?: boolean;
}

export const useNavigationWarning = ({
  hasUnsavedChanges,
  templateId,
  isUpdate = false,
}: UseNavigationWarningProps) => {
  const router = useRouter();
  const { open } = useDialogStore();

  // Función para manejar navegación con advertencia
  const handleNavigationWithWarning = useCallback(
    (url: string) => {
      if (hasUnsavedChanges()) {
        open("navigation-warning", "delete", { targetUrl: url });
      } else {
        router.push(url);
      }
    },
    [hasUnsavedChanges, open, router]
  );

  // Función para confirmar navegación (llamada desde el diálogo)
  const handleNavigationConfirm = useCallback(
    (targetUrl: string) => {
      // Limpiar el draft antes de navegar
      if (templateId) {
        // Importar dinámicamente para evitar circular dependencies
        import("../_stores/template-draft.store").then(({ useTemplateDraftStore }) => {
          const { clearDraft } = useTemplateDraftStore.getState();
          clearDraft(templateId, isUpdate);
        });
      }
      router.push(targetUrl);
    },
    [router, templateId, isUpdate]
  );

  // Interceptar clicks en links que salgan de la página
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // No interceptar si el click viene de un botón o elemento que maneja su propia navegación
      const isButton = target.closest("button");
      const isDropdownItem = target.closest("[role='menuitem']");
      const isActionElement = target.closest("[data-action]");

      if (isButton || isDropdownItem || isActionElement) {
        return;
      }

      const link = target.closest("a[href]") as HTMLAnchorElement;

      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Solo interceptar links que naveguen fuera de la página actual
      const currentPath = window.location.pathname;
      const isExternalLink = href.startsWith("http") || href.startsWith("//");
      const isSamePage = href === currentPath || href === window.location.href;

      if (isExternalLink || isSamePage) return;

      // Interceptar navegación
      e.preventDefault();
      handleNavigationWithWarning(href);
    };

    // Agregar event listener
    document.addEventListener("click", handleClick, true);

    // Limpiar event listener
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [handleNavigationWithWarning]);

  // Interceptar navegación del navegador (back/forward/refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?";
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        open("navigation-warning", "delete", { targetUrl: window.location.href });
        // Restaurar la URL actual
        window.history.pushState(null, "", window.location.href);
      }
    };

    // Agregar event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    // Limpiar event listeners
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, open]);

  return {
    handleNavigationWithWarning,
    handleNavigationConfirm,
  };
};
