import { create } from "zustand";

import { ObjectiveResponse, ServiceResponse } from "../_types/services.types";

interface ServiceStore {
  service: ServiceResponse | null;
  setService: (service: ServiceResponse) => void;
  objectives: ObjectiveResponse[];
  setObjectives: (objectives: ObjectiveResponse[]) => void;
  selectedObjective: ObjectiveResponse | null;
  setSelectedObjective: (selectedObjective: ObjectiveResponse | null) => void;
  selectedService: ServiceResponse | null;
  setSelectedService: (selectedService: ServiceResponse | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isCreating: boolean;
  setIsCreating: (isCreating: boolean) => void;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  service: null,
  setService: (service: ServiceResponse) => set({ service }),
  objectives: [],
  setObjectives: (objectives: ObjectiveResponse[]) => set({ objectives }),
  //activities: [],
  //setActivities: (activities: Activity[]) => set({ activities }),
  selectedObjective: null,
  setSelectedObjective: (selectedObjective: ObjectiveResponse | null) => set({ selectedObjective }),
  selectedService: null,
  setSelectedService: (selectedService: ServiceResponse | null) => set({ selectedService }),
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  error: null,
  setError: (error: string | null) => set({ error }),
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
  isEditing: false,
  setIsEditing: (isEditing: boolean) => set({ isEditing }),
  isCreating: false,
  setIsCreating: (isCreating: boolean) => set({ isCreating }),
  isDeleting: false,
  setIsDeleting: (isDeleting: boolean) => set({ isDeleting }),
}));
