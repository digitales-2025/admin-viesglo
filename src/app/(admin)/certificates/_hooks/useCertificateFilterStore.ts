import { DateRange } from "react-day-picker";
import { create } from "zustand";

interface CertificateFilterState {
  // Estado
  dateRange: DateRange | undefined;

  // Acciones
  setDateRange: (dateRange: DateRange | undefined) => void;
  clearDateRange: () => void;
  clearAll: () => void;
}

export const useCertificateFilterStore = create<CertificateFilterState>((set) => ({
  // Estado inicial
  dateRange: undefined,

  // Acciones
  setDateRange: (dateRange) => set({ dateRange }),
  clearDateRange: () => set({ dateRange: undefined }),
  clearAll: () => set({ dateRange: undefined }),
}));
