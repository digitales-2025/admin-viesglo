export type QuotationResponse = Omit<any, "quotationGroup"> & {
  quotationGroup: QuotationGroupResponse;
};

export type QuotationCreate = any;

export type QuotationUpdate = any;

export type QuotationConcrete = any;

export type QuotationGroupResponse = any;

export type QuotationGroupCreate = any;

export type QuotationGroupUpdate = any;

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
