import { create } from "zustand";

import { ActivityResponse, ObjectiveResponse, ServiceResponse } from "../_types/services.types";

interface ServiceStore {
  service: ServiceResponse | null;
  setService: (service: ServiceResponse) => void;
  objectives: ObjectiveResponse[];
  setObjectives: (objectives: ObjectiveResponse[]) => void;
  activities: ActivityResponse[];
  setActivities: (activities: ActivityResponse[]) => void;
  selectedObjective: ObjectiveResponse | null;
  setSelectedObjective: (selectedObjective: ObjectiveResponse | null) => void;
  selectedActivity: ActivityResponse | null;
  setSelectedActivity: (selectedActivity: ActivityResponse | null) => void;
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
  clearOnServiceDelete: (serviceId: string) => void;
  clearOnObjectiveDelete: (objectiveId: string) => void;
  clearOnActivityDelete: (activityId: string) => void;
}

export const useServiceStore = create<ServiceStore>((set) => ({
  service: null,
  setService: (service: ServiceResponse) => set({ service }),
  objectives: [],
  setObjectives: (objectives: ObjectiveResponse[]) => set({ objectives }),
  activities: [],
  setActivities: (activities: ActivityResponse[]) => set({ activities }),
  selectedObjective: null,
  setSelectedObjective: (selectedObjective: ObjectiveResponse | null) => set({ selectedObjective }),
  selectedActivity: null,
  setSelectedActivity: (selectedActivity: ActivityResponse | null) => set({ selectedActivity }),
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
  clearOnServiceDelete: (serviceId: string) =>
    set((state) => {
      if (state.selectedService?.id === serviceId) {
        return {
          ...state,
          selectedService: null,
          selectedObjective: null,
          selectedActivity: null,
          objectives: [],
          activities: [],
          service: null,
        };
      }
      return state;
    }),
  clearOnObjectiveDelete: (objectiveId: string) =>
    set((state) => {
      if (state.selectedObjective?.id === objectiveId) {
        return {
          ...state,
          selectedObjective: null,
          selectedActivity: null,
          activities: [],
        };
      }
      return state;
    }),
  clearOnActivityDelete: (activityId: string) =>
    set((state) => {
      if (state.selectedActivity?.id === activityId) {
        return {
          ...state,
          selectedActivity: null,
        };
      }
      return state;
    }),
}));
