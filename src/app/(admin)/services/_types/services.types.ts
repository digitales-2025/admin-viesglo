import { components } from "@/lib/api/types/api";

// Servicios
export type ServiceResponseOriginal = components["schemas"]["ServiceResponseDto"];
export type ServiceResponse = Omit<ServiceResponseOriginal, "objectives"> & {
  objectives?: ObjectiveResponse[];
};
export type OriginalServiceCreate = components["schemas"]["CreateServiceDto"];
export type ServiceCreate = Omit<OriginalServiceCreate, "objectives"> & {
  objectives?: string[];
};
export type ServiceUpdate = components["schemas"]["UpdateServiceDto"];
export type OriginalServiceUpdate = Omit<ServiceUpdate, "objectives"> & {
  objectives?: string[];
};

// Objetivos
export type ObjectiveResponseOriginal = components["schemas"]["ObjectiveResponseDto"];
export type ObjectiveResponse = ObjectiveResponseOriginal & {
  activities: ActivityResponse[];
};
export type OriginalObjectiveCreate = components["schemas"]["CreateObjectiveDto"];
export type ObjectiveCreate = Omit<OriginalObjectiveCreate, "serviceId"> & {
  serviceId?: string;
};
export type ObjectiveUpdate = components["schemas"]["UpdateObjectiveDto"];
export type OriginalObjectiveUpdate = Omit<ObjectiveUpdate, "serviceId"> & {
  serviceId?: string;
};

// Actividades
export type ActivityCreate = components["schemas"]["CreateActivityDto"];
export type ActivityResponse = components["schemas"]["ActivityResponseDto"];
export type ActivityUpdate = components["schemas"]["UpdateActivityDto"];
