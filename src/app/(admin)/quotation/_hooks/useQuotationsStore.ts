import { create } from "zustand";

import { PaginatedQuotationResponse, QuotationResponse } from "../_types/quotation.types";

interface QuotationsState {
  // Datos de cotizaciones
  quotations: QuotationResponse[];
  meta?: PaginatedQuotationResponse["meta"];
  isLoading: boolean;
  error?: string;

  // Método para actualizar los datos
  setQuotationsData: (data: {
    quotations: QuotationResponse[];
    meta?: PaginatedQuotationResponse["meta"];
    isLoading?: boolean;
    error?: string;
  }) => void;
}

export const useQuotationsStore = create<QuotationsState>()((set) => ({
  // Estado inicial de datos
  quotations: [],
  isLoading: false,

  // Acción para actualizar datos
  setQuotationsData: (data) =>
    set((state) => ({
      quotations: data.quotations,
      meta: data.meta,
      isLoading: data.isLoading !== undefined ? data.isLoading : state.isLoading,
      error: data.error,
    })),
}));
