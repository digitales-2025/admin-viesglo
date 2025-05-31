import { components } from "@/lib/api/types/api";

export type QuotationResponse = Omit<components["schemas"]["QuotationResponseDto"], "quotationGroup"> & {
  quotationGroup: QuotationGroupResponse;
};

export type QuotationCreate = components["schemas"]["CreateQuotationDto"];

export type QuotationUpdate = components["schemas"]["UpdateQuotationDto"];

export type QuotationConcrete = components["schemas"]["ConcreteQuotationDto"];

export type QuotationGroupResponse = components["schemas"]["QuotationGroupResponseDto"];

export type QuotationGroupCreate = components["schemas"]["CreateQuotationGroupDto"];

export type QuotationGroupUpdate = components["schemas"]["UpdateQuotationGroupDto"];

export type PaginatedQuotationResponse = {
  data: QuotationResponse[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
};

export type QuotationFilters = {
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

export enum PaymentPlan {
  SINGLE = "SINGLE",
  INSTALLMENTS = "INSTALLMENTS",
}

export const LabelPaymentPlan = {
  [PaymentPlan.SINGLE]: "Único",
  [PaymentPlan.INSTALLMENTS]: "Fraccionado",
};
