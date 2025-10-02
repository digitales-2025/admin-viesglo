import { useCallback, useState } from "react";

export function useFilters<T = Record<string, any>>(defaultFilters?: T) {
  const [filters, setFilters] = useState<T | undefined>(defaultFilters);

  // Fusiona filtros en lugar de reemplazarlos para permitir combinaciones (y elimina claves con valores vacíos)
  const updateFilters = useCallback((newFilters: T) => {
    setFilters((prev) => {
      const next = { ...(prev as any) } as T;
      Object.entries(newFilters as any).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          (next as any)[key] = value;
        } else {
          delete (next as any)[key];
        }
      });
      return next;
    });
  }, []);

  const updateFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    setFilters((prev) => {
      if (!prev) return { [key]: value } as T;

      const newFilters = { ...prev } as T;
      if (value !== undefined && value !== null && value !== "") {
        (newFilters as any)[key] = value;
      } else {
        delete (newFilters as any)[key];
      }
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const clearFilter = useCallback((key: keyof T) => {
    setFilters((prev) => {
      if (!prev) return prev;
      const newFilters = { ...prev } as T;
      delete (newFilters as any)[key];
      return newFilters;
    });
  }, []);

  return {
    filters,
    updateFilters,
    updateFilter,
    clearFilters,
    clearFilter,
  };
}
