/**
 * Enums para proyectos
 * Basado en el backend: src/domain/enums/project-type.enum.ts
 */

export enum ProjectTypeEnum {
  DOCUMENTADO = "DOCUMENTADO",
  HIBRIDO = "HIBRIDO",
  IMPLEMENTADO = "IMPLEMENTADO",
}

export enum ProjectStatusEnum {
  CREATED = "CREATED",
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  OPERATIONALLY_COMPLETED = "OPERATIONALLY_COMPLETED",
  OFFICIALLY_COMPLETED = "OFFICIALLY_COMPLETED",
}

export enum MilestoneStatusEnum {
  PLANNING = "PLANNING",
  VALIDATED = "VALIDATED",
  IN_PROGRESS = "IN_PROGRESS",
  OPERATIONALLY_COMPLETED = "OPERATIONALLY_COMPLETED",
  OFFICIALLY_APPROVED = "OFFICIALLY_APPROVED",
}

export enum DeliverableStatusEnum {
  REGISTERED = "REGISTERED",
  IN_PROCESS = "IN_PROCESS",
  FINISHED = "FINISHED",
}

export enum DeliverablePriorityEnum {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// Enums
export enum BondTypeEnum {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export enum ProjectDelayLevelEnum {
  ON_TIME = "ON_TIME",
  AHEAD = "AHEAD",
  ACCEPTABLE_DELAY = "ACCEPTABLE_DELAY",
  CRITICAL_DELAY = "CRITICAL_DELAY",
}
