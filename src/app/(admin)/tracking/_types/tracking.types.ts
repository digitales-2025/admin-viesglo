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
export type ProjectActivityResponse = Omit<components["schemas"]["ProjectActivityResponseDto"], "responsibleUser"> & {
  responsibleUser: components["schemas"]["ResponsibleUserResponseDto"];
};

export type CreateProjectActivity = components["schemas"]["CreateProjectActivityDto"];
export type UpdateProjectActivity = components["schemas"]["UpdateProjectActivityDto"];

export type TrackingActivityDto = components["schemas"]["TrackingActivityDto"];

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
  responsableUserId?: string;
  status?: string;
  search?: string;
  clientId?: string;
  isActive?: string;
};

export enum FileType {
  PDF = "PDF",
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  OTHER = "OTHER",
}
