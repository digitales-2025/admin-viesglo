import { components } from "@/lib/api/types/api";

export type ProjectResponse = components["schemas"]["ProjectResponseDto"];
export type CreateProject = components["schemas"]["CreateProjectDto"];
export type UpdateProject = components["schemas"]["UpdateProjectDto"];

// Servicios de un proyecto
export type ProjectServiceResponse = components["schemas"]["ProjectServiceResponseDto"];
export type CreateProjectService = components["schemas"]["CreateProjectServiceDto"];
export type UpdateProjectService = components["schemas"]["UpdateProjectServiceDto"];

// Objetivos de un proyecto
export type ProjectObjectiveResponse = components["schemas"]["ProjectObjectiveResponseDto"];
export type CreateProjectObjective = components["schemas"]["CreateProjectObjectiveDto"];
export type UpdateProjectObjective = components["schemas"]["UpdateProjectObjectiveDto"];

// Actividades de un proyecto
export type ProjectActivityResponse = components["schemas"]["ProjectActivityResponseDto"];
export type CreateProjectActivity = components["schemas"]["CreateProjectActivityDto"];
export type UpdateProjectActivity = components["schemas"]["UpdateProjectActivityDto"];

// Upload evidencia
export type UploadEvidence = components["schemas"]["UploadEvidenceDto"];
