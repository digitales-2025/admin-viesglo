/**
 * Tipos para la gestión de incidencias
 */

export interface CreateIncidentRequestDto {
  /** ID del proyecto */
  projectId?: string;
  /** ID del hito */
  milestoneId?: string;
  /** ID de la fase */
  phaseId?: string;
  /** ID del entregable */
  deliverableId: string;
  /** Fecha de la incidencia */
  date: string;
  /** Descripción detallada de la incidencia */
  description: string;
}

export interface UpdateIncidentRequestDto {
  /** Fecha de la incidencia */
  date?: string;
  /** Descripción detallada de la incidencia */
  description?: string;
}

export interface IncidentResponseDto {
  /** ID único de la incidencia */
  id: string;
  /** ID del entregable */
  deliverableId: string;
  /** Fecha de la incidencia */
  date: string;
  /** Descripción detallada de la incidencia */
  description: string;
  /** Estado de resolución */
  isResolved: boolean;
  /** ID del usuario que creó la incidencia */
  createdById: string;
  /** ID del usuario que resolvió la incidencia */
  resolvedById?: string;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de actualización */
  updatedAt: string;
  /** Fecha de resolución */
  resolvedAt?: string;
}

export interface PaginatedIncidentResponseDto {
  /** Lista de incidencias */
  data: IncidentResponseDto[];
  /** Metadatos de paginación */
  meta: {
    /** Página actual */
    page: number;
    /** Tamaño de página */
    pageSize: number;
    /** Total de registros */
    total: number;
    /** Total de páginas */
    totalPages: number;
  };
}

export interface IncidentPaginatedFilterDto {
  /** Número de página */
  page?: number;
  /** Tamaño de página */
  pageSize?: number;
  /** Término de búsqueda */
  search?: string;
  /** ID del proyecto */
  projectId?: string;
  /** ID del hito */
  milestoneId?: string;
  /** ID de la fase */
  phaseId?: string;
  /** ID del entregable */
  deliverableId?: string;
  /** Estado de resolución */
  isResolved?: boolean;
  /** ID del usuario que creó la incidencia */
  createdById?: string;
  /** ID del usuario que resolvió la incidencia */
  resolvedById?: string;
  /** Campo por el cual ordenar */
  sortField?: string;
  /** Orden de clasificación */
  sortOrder?: "asc" | "desc";
}
