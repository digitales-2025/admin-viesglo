import { create } from "zustand";

interface OpenMilestoneState {
  openMilestoneId: string | null;
  setOpenMilestone: (milestoneId: string | null) => void;
  toggleMilestone: (milestoneId: string) => void;
}

export const useOpenMilestoneStore = create<OpenMilestoneState>((set, get) => ({
  openMilestoneId: null,
  setOpenMilestone: (milestoneId) => set({ openMilestoneId: milestoneId }),
  toggleMilestone: (milestoneId) => {
    const current = get().openMilestoneId;
    set({ openMilestoneId: current === milestoneId ? null : milestoneId });
  },
}));
