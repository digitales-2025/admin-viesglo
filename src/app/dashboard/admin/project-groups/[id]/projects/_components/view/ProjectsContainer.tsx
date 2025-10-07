import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Loading } from "@/shared/components/loading";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useSearchProjects } from "../../_hooks/use-project";
import { useProjectGroupById } from "../../../../_hooks/use-project-groups";
import ProjectCard from "./ProjectCard";
import ProjectsFilters from "./ProjectsFilters";

interface ProjectsContainerProps {
  projectGroupId: string;
}

export default function ProjectsContainer({ projectGroupId }: ProjectsContainerProps) {
  // Estados para búsqueda
  const [inputValue, setInputValue] = useState("");

  // Hook para obtener información del grupo de proyectos
  const groupQuery = useProjectGroupById(projectGroupId);
  const projectGroup = groupQuery.data;

  // Hook de búsqueda de proyectos con filtro por grupo
  const {
    query,
    allProjects,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    handleSearchChange,
    handleProjectGroupFilter,
    handleStatusFilter,
    handleProjectTypeFilter,
    handleScrollEnd,
    selectedStatuses,
    selectedProjectTypes,
  } = useSearchProjects();

  // Configurar filtro por grupo de proyectos
  useEffect(() => {
    if (projectGroupId) {
      handleProjectGroupFilter(projectGroupId);
    }
  }, [projectGroupId, handleProjectGroupFilter]);

  // Debounce para búsqueda (basado en autocomplete.tsx)
  const debouncedSearch = useDebouncedCallback((term: string) => {
    handleSearchChange(term);
  }, 300);

  // Manejo de cambios en el input de búsqueda
  const handleInputChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue);
      debouncedSearch(newValue);
    },
    [debouncedSearch]
  );

  // Scroll infinito responsive (basado en autocomplete.tsx)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!hasNextPage || isFetchingNextPage) return;

      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px margen

      if (isAtBottom) {
        handleScrollEnd();
      }
    },
    [hasNextPage, isFetchingNextPage, handleScrollEnd]
  );

  // Calcular progreso general del grupo
  const overallProgress =
    allProjects.length > 0
      ? Math.round(allProjects.reduce((acc, project) => acc + (project.overallProgress || 0), 0) / allProjects.length)
      : 0;
  return (
    <div>
      <div>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar proyecto..."
              className="pl-10"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
            />
          </div>

          <ProjectsFilters
            selectedProjectTypes={selectedProjectTypes}
            selectedProjectStatuses={selectedStatuses}
            onProjectTypesChange={handleProjectTypeFilter}
            onProjectStatusesChange={handleStatusFilter}
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          {/* Main Project Header */}
          <div className="mb-8">
            <div className="gap-4">
              <h2 className="font-bold text-gray-900">{projectGroup?.name || "Proyectos del Grupo"}</h2>
            </div>
            <div className="flex items-center gap-4 justify-center mb-2">
              <span className="text-sm text-gray-600">Avance general del grupo</span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-7 flex items-center">
              <div
                className="bg-primary h-8 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
              <span className="text-lg font-semibold text-gray-900">{overallProgress}%</span>
            </div>
          </div>
          {/* Loading State */}
          {isLoading && <Loading text="Cargando proyectos..." variant="spinner" />}
          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-destructive mb-2">Error al cargar los proyectos</div>
              <Button variant="outline" onClick={() => query.refetch()}>
                Reintentar
              </Button>
            </div>
          )}
          {/* Projects Grid with Infinite Scroll */}
          {!isLoading && !isError && (
            <div
              ref={scrollContainerRef}
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 max-h-[calc(100vh-300px)] overflow-y-auto"
              onScroll={handleScroll}
            >
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}

              {/* Loading indicator for next page */}
              {isFetchingNextPage && (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Cargando más proyectos...</span>
                </div>
              )}

              {/* No results */}
              {allProjects.length === 0 && !isLoading && (
                <div className="col-span-full text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    {inputValue ? "No se encontraron proyectos con ese criterio" : "No hay proyectos en este grupo"}
                  </div>
                  {inputValue && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInputValue("");
                        handleInputChange("");
                      }}
                    >
                      Limpiar búsqueda
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
