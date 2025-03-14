import { components } from "@/lib/api/types/api";

export type ServiceResponseOriginal = components["schemas"]["ServiceResponseDto"];
export type ServiceResponse = Omit<ServiceResponseOriginal, "objectives"> & {
  objectives?: string[];
};

export type ObjectiveResponse = components["schemas"]["ObjectiveResponseDto"];
export type ActivityResponse = components["schemas"]["ActivityResponseDto"];

export type OriginalServiceCreate = components["schemas"]["CreateServiceDto"];
export type ServiceCreate = Omit<OriginalServiceCreate, "objectives"> & {
  objectives?: string[];
};

export type ServiceUpdate = components["schemas"]["UpdateServiceDto"];
export type OriginalServiceUpdate = Omit<ServiceUpdate, "objectives"> & {
  objectives?: string[];
};
