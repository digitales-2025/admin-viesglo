import { create } from "zustand";

import { PaymentFilters } from "../_types/payment.types";

// Definimos un tipo personalizado para almacenar solo los filtros sin paginación
type PaymentFilterData = Omit<PaymentFilters, "page" | "limit">;

interface PaymentsState {
  // Solo filtros de búsqueda, sin paginación
  filters: PaymentFilterData;

  // Métodos para actualizar filtros
  setFilters: (filters: PaymentFilterData) => void;
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

// Valores por defecto para los filtros (vacíos)
const DEFAULT_FILTERS: PaymentFilterData = {
  from: undefined,
  to: undefined,
};

export const usePaymentsStore = create<PaymentsState>()((set) => ({
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
