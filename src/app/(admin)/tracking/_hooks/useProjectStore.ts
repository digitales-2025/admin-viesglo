import { create } from "zustand";

import { ProjectResponse } from "../_types/tracking.types";

interface ProjectStore {
  projects: ProjectResponse[];
  setProjects: (projects: ProjectResponse[]) => void;
  selectedProject: ProjectResponse | null;
  setSelectedProject: (selectedProject: ProjectResponse | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  setProjects: (projects: ProjectResponse[]) => set({ projects }),
  selectedProject: null,
  setSelectedProject: (selectedProject: ProjectResponse | null) => set({ selectedProject }),
}));
