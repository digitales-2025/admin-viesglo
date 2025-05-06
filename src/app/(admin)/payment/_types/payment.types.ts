import { components } from "@/lib/api/types/api";

export type PaymentResponse = components["schemas"]["PaymentResponseDto"];

export type UpdatePaymentStatus = components["schemas"]["UpdatePaymentStatusDto"];

export type MarkPaymentStatus = components["schemas"]["MarkPaymentStatusDto"];

export type PaginatedPaymentResponse = {
  data: PaymentResponse[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type PaymentFilters = {
  code?: string | string[];
  ruc?: string;
  businessName?: string;
  service?: string | string[];
  department?: string | string[];
  isConcrete?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  from?: Date;
  to?: Date;
};
