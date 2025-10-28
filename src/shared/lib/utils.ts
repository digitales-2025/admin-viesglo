import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Implementa un debounce para funciones, útil para eventos como búsquedas
 * @param fn Función a ejecutar después del tiempo de espera
 * @param wait Tiempo en ms a esperar entre ejecuciones
 * @returns Función con debounce
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, wait: number = 300) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function debounced(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      fn(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  }

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}
