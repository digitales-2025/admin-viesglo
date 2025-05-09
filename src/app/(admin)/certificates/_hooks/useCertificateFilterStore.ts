import { create } from "zustand";

import { CertificatesFilters } from "../_types/certificates.types";

type CertificatesFilterData = Omit<CertificatesFilters, "page" | "limit">;

interface CertificatesState {
  filters: CertificatesFilterData;

  setFilters: (filtes: CertificatesFilterData) => void;
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: CertificatesFilterData = {};

export const useCertificatesStore = create<CertificatesState>()((set) => ({
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
