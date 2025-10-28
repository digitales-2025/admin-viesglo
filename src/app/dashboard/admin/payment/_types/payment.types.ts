import { PaymentPlan } from "../../quotation/_types/quotation.types";

export type PaymentResponse = any;

export type UpdatePaymentStatus = any;

export type MarkPaymentStatus = any;

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
  years?: number[];
};

export type PaymentsComparisonResponse = any;
