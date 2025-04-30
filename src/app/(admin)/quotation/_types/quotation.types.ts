import { components } from "@/lib/api/types/api";

export type QuotationResponse = components["schemas"]["QuotationResponseDto"];

export type QuotationCreate = components["schemas"]["CreateQuotationDto"];

export type QuotationUpdate = components["schemas"]["UpdateQuotationDto"];

export type QuotationConcrete = components["schemas"]["ConcreteQuotationDto"];

export type QuotationGroupResponse = components["schemas"]["QuotationGroupResponseDto"];

export type QuotationGroupCreate = components["schemas"]["CreateQuotationGroupDto"];

export type QuotationGroupUpdate = components["schemas"]["UpdateQuotationGroupDto"];
