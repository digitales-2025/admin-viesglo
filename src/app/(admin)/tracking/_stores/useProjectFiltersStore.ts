import { create } from "zustand";

import { ProjectFilterValues } from "../_components/ProjectsAdvancedSearch";

interface ProjectFiltersStore {
  filters: ProjectFilterValues;
  setFilters: (filters: ProjectFilterValues) => void;
  clearFilters: () => void;
}

export const useProjectFiltersStore = create<ProjectFiltersStore>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
