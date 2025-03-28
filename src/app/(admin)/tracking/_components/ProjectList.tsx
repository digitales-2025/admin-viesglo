"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useProjects, useProjectsByFilters } from "../_hooks/useProject";
import ProjectCard from "./ProjectCard";
import { ProjectFilterValues, ProjectsAdvancedSearch } from "./ProjectsAdvancedSearch";

export default function ProjectList() {
  const { open } = useDialogStore();
  const [filters, setFilters] = useState<ProjectFilterValues>({});
  const [isFiltering, setIsFiltering] = useState(false);

  // Consulta inicial para todos los proyectos (sin filtros)
  const { data: allProjects, isLoading: isLoadingAll, error: errorAll, refetch: refetchAll } = useProjects();

  // Consulta para proyectos filtrados
  const {
    data: filteredProjects,
    isLoading: isLoadingFiltered,
    error: errorFiltered,
    refetch: refetchFiltered,
  } = useProjectsByFilters(isFiltering ? filters : {});

  // Determinar qué datos, estado de carga y error mostrar
  const projects = isFiltering ? filteredProjects : allProjects;
  const isLoading = isFiltering ? isLoadingFiltered : isLoadingAll;
  const error = isFiltering ? errorFiltered : errorAll;
  const refetch = isFiltering ? refetchFiltered : refetchAll;

  const handleSearch = (newFilters: ProjectFilterValues) => {
    const hasActiveFilters = Object.values(newFilters).some(
      (value) => value !== undefined && value !== "" && value !== null
    );

    setFilters(newFilters);
    setIsFiltering(hasActiveFilters);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end items-center">
        <Button variant="outline" onClick={() => open("projects", "create")}>
          <Plus className="size-4 mr-2" />
          Agregar proyecto
        </Button>
      </div>

      <ProjectsAdvancedSearch onSearch={handleSearch} defaultValues={filters} />

      {isLoading && (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <p>Error: {error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {projects && projects.length === 0 && !isLoading && (
        <div className="p-8 text-center border rounded-md bg-muted/10">
          <p className="text-muted-foreground">
            {isFiltering ? "No se encontraron proyectos con los filtros seleccionados" : "No hay proyectos disponibles"}
          </p>
        </div>
      )}
      {projects && projects.length > 0 && (
        <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
