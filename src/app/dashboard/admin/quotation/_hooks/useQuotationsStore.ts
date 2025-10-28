import { create } from "zustand";

import { QuotationFilters } from "../_types/quotation.types";

// Definimos un tipo personalizado para almacenar solo los filtros sin paginación
type QuotationFilterData = Omit<QuotationFilters, "page" | "limit">;

interface QuotationsState {
  // Solo filtros de búsqueda, sin paginación
  filters: QuotationFilterData;

  // Métodos para actualizar filtros
  setFilters: (filters: QuotationFilterData) => void;
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

// Valores por defecto para los filtros (vacíos)
const DEFAULT_FILTERS: QuotationFilterData = {
  from: undefined,
  to: undefined,
};

export const useQuotationsStore = create<QuotationsState>()((set) => ({
  // Estado inicial de filtros (vacío)
  filters: DEFAULT_FILTERS,

  // Métodos para gestionar filtros
  setFilters: (filters) => set({ filters }),

  // Actualizar un filtro específico
  updateFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  // Resetear todos los filtros
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
