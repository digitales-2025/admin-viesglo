import { components } from "@/lib/api/types/api";

export type ResourceCategory = "DIRECT_COSTS" | "INDIRECT_COSTS" | "EXPENSES";
export type ResourceResponseDto = components["schemas"]["ResourceResponseDto"];
export type CreateResourceRequestDto = components["schemas"]["CreateResourceRequestDto"];
export type UpdateResourceRequestDto = components["schemas"]["UpdateResourceRequestDto"];
export type PaginatedResourceResponseDto = components["schemas"]["PaginatedResourceResponseDto"];
