"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { useAuthLoading } from "./use-auth-loading";

export const useRouteLoading = () => {
  const pathname = usePathname();
  const { hide } = useAuthLoading();
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    // Si cambió la ruta, esperar a que se complete la renderización y ocultar loading
    if (previousPathnameRef.current !== pathname) {
      // Pequeño delay para asegurar que la página se renderizó completamente
      const timer = setTimeout(() => {
        hide();
      }, 100);

      previousPathnameRef.current = pathname;

      return () => clearTimeout(timer);
    }
  }, [pathname, hide]);
};
