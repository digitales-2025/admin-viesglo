export type ProjectResponse = Omit<any, "services"> & {
  services: ProjectServiceResponse[];
};
export type CreateProject = any;
export type UpdateProject = any;
// Tipo específico para actualizar un proyecto sin incluir servicios
export type UpdateProjectWithoutServices = Omit<UpdateProject, "services">;

// Servicios de un proyecto
export type ProjectServiceResponse = Omit<any, "objectives"> & {
  objectives: ProjectObjectiveResponse[];
};
export type CreateProjectService = any;
export type UpdateProjectService = any;

// Objetivos de un proyecto
export type ProjectObjectiveResponse = Omit<any, "activities"> & {
  activities: ProjectActivityResponse[];
};
export type CreateProjectObjective = any;
export type UpdateProjectObjective = any;

// Actividades de un proyecto
export type ProjectActivityResponse = Omit<any, "responsibleUser"> & {
  responsibleUser: any;
};

export type CreateProjectActivity = any;
export type UpdateProjectActivity = any;

export type TrackingActivityDto = any;

// Paginación
export type ProjectPaginationResponse = Omit<any, "data"> & {
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

export enum ProjectStatus {
  PLANNED = "PLANNED",
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNED]: "Planificado",
  [ProjectStatus.ACTIVE]: "Activo",
  [ProjectStatus.ON_HOLD]: "En espera",
  [ProjectStatus.COMPLETED]: "Completado",
  [ProjectStatus.CANCELLED]: "Cancelado",
};

export const ProjectStatusColors: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNED]: "text-sky-500 bg-sky-500/10",
  [ProjectStatus.ACTIVE]: "text-emerald-500 bg-emerald-500/10",
  [ProjectStatus.ON_HOLD]: "text-orange-500 bg-orange-500/10",
  [ProjectStatus.COMPLETED]: "text-green-500 bg-green-500/10",
  [ProjectStatus.CANCELLED]: "text-rose-500 bg-rose-500/10",
};
