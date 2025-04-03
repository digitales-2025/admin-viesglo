import { components } from "@/lib/api/types/api";

export type ProjectResponse = Omit<components["schemas"]["ProjectResponseDto"], "services"> & {
  services: ProjectServiceResponse[];
};
export type CreateProject = components["schemas"]["CreateProjectDto"];
export type UpdateProject = components["schemas"]["UpdateProjectDto"];
// Tipo específico para actualizar un proyecto sin incluir servicios
export type UpdateProjectWithoutServices = Omit<UpdateProject, "services">;

// Servicios de un proyecto
export type ProjectServiceResponse = Omit<components["schemas"]["ProjectServiceResponseDto"], "objectives"> & {
  objectives: ProjectObjectiveResponse[];
};
export type CreateProjectService = components["schemas"]["CreateProjectServiceDto"];
export type UpdateProjectService = components["schemas"]["UpdateProjectServiceDto"];

// Objetivos de un proyecto
export type ProjectObjectiveResponse = Omit<components["schemas"]["ProjectObjectiveResponseDto"], "activities"> & {
  activities: ProjectActivityResponse[];
};
export type CreateProjectObjective = components["schemas"]["CreateProjectObjectiveDto"];
export type UpdateProjectObjective = components["schemas"]["UpdateProjectObjectiveDto"];

// Actividades de un proyecto
export type ProjectActivityResponse = components["schemas"]["ProjectActivityResponseDto"];
export type CreateProjectActivity = components["schemas"]["CreateProjectActivityDto"];
export type UpdateProjectActivity = components["schemas"]["UpdateProjectActivityDto"];

// Upload evidencia
export type UploadEvidence = components["schemas"]["UploadEvidenceDto"];

// Paginación
export type ProjectPaginationResponse = Omit<components["schemas"]["PaginatedProjectResponseDto"], "data"> & {
  data: ProjectResponse[];
};

// Filtros de proyectos
export type ProjectFilters = {
  typeContract?: string;
  typeProject?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  status?: string;
  search?: string;
  clientId?: string;
  isActive?: string;
};
