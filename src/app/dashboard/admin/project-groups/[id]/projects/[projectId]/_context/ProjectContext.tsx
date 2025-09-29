"use client";

import React, { createContext, ReactNode, useContext } from "react";

import { useProjectById } from "@/app/dashboard/admin/tracking/_hooks/useProject";

interface ProjectContextType {
  projectData: any; // Reemplaza 'any' con el tipo correcto de tu proyecto
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectProvider({ children, projectId }: ProjectProviderProps) {
  const { query } = useProjectById(projectId);
  const { data: projectData, isLoading, error, refetch } = query;

  const value: ProjectContextType = {
    projectData,
    isLoading,
    error,
    refetch,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}
