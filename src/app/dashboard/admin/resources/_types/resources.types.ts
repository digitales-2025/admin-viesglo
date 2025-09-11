/**
 * Tipos para la gestión de recursos
 */

export type ResourceCategory = "DIRECT_COSTS" | "INDIRECT_COSTS" | "EXPENSES";

export interface ResourceResponseDto {
  id: string;
  name: string;
  category: ResourceCategory;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequestDto {
  name: string;
  category: ResourceCategory;
  description?: string;
}

export interface UpdateResourceRequestDto {
  name?: string;
  category?: ResourceCategory;
  description?: string;
}

export interface PaginatedResourceResponseDto {
  data: ResourceResponseDto[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ResourceFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
}
