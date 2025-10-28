// Servicios
export type ServiceResponseOriginal = any;
export type ServiceResponse = Omit<ServiceResponseOriginal, "objectives"> & {
  objectives?: ObjectiveResponse[];
};
export type OriginalServiceCreate = any;
export type ServiceCreate = Omit<OriginalServiceCreate, "objectives"> & {
  objectives?: string[];
};
export type ServiceUpdate = any;
export type OriginalServiceUpdate = Omit<ServiceUpdate, "objectives"> & {
  objectives?: string[];
};

// Objetivos
export type ObjectiveResponseOriginal = any;
export type ObjectiveResponse = ObjectiveResponseOriginal & {
  activities: ActivityResponse[];
};
export type OriginalObjectiveCreate = any;
export type ObjectiveCreate = Omit<OriginalObjectiveCreate, "serviceId"> & {
  serviceId?: string;
};
export type ObjectiveUpdate = any;
export type OriginalObjectiveUpdate = Omit<ObjectiveUpdate, "serviceId"> & {
  serviceId?: string;
};

// Actividades
export type ActivityCreate = any;
export type ActivityResponse = any;
export type ActivityUpdate = any;
