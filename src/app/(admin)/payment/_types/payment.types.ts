import { components } from "@/lib/api/types/api";
import { PaymentPlan } from "../../quotation/_types/quotation.types";

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
  isPaid?: boolean;
  paymentPlan?: PaymentPlan;
  search?: string;
  page?: number;
  limit?: number;
  from?: Date;
  to?: Date;
};

export type PaymentsComparisonResponse = components["schemas"]["PaymentsComparisonResponseDto"];
