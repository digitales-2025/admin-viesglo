export type ProjectGroupStatus = "activo" | "inactivo";

export interface ProjectGroupResponseDto {
  id: string;
  name: string;
  description?: string;
  status: string;
  period: string; // Formato YYYY-MM
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateProjectGroupRequestDto {
  name: string;
  description?: string;
  status: ProjectGroupStatus;
  period: string; // Formato YYYY-MM
}

export interface UpdateProjectGroupRequestDto {
  name?: string;
  description?: string;
  status?: ProjectGroupStatus;
  period?: string; // Formato YYYY-MM
  isActive?: boolean;
}

export interface PaginatedProjectGroupResponseDto {
  data: ProjectGroupResponseDto[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ProjectGroupFilters {
  search?: string;
  status?: string;
  period?: string;
}

// Tipos para proyectos asociados a un grupo
export interface ProjectResponseDto {
  id: string;
  name: string;
  description?: string;
  status: string;
  progressPercentage: number;
  startDate: string;
  endDate?: string;
  projectGroupId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedProjectResponseDto {
  data: ProjectResponseDto[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
