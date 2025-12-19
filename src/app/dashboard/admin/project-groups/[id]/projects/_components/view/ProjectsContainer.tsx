import React, { useCallback, useEffect, useRef, useState } from "react";
import { FolderOpen, Loader2, Search, SearchIcon } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useSearchProjects } from "../../_hooks/use-project";
import { useProjectGroupById } from "../../../../_hooks/use-project-groups";
import ProjectCard from "./ProjectCard";
import ProjectsFilters from "./ProjectsFilters";
import { ProjectsSkeleton } from "./ProjectsSkeleton";

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
    handleDelayLevelFilter,
    handleSortChange,
    handleScrollEnd,
    selectedStatuses,
    selectedProjectTypes,
    selectedDelayLevels,
    projectSortField,
    sortOrder,
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

  // Scroll infinito con Intersection Observer (más eficiente)
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para detectar cuando el usuario llega al final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          handleScrollEnd();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px", // Cargar cuando esté a 100px del final
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, handleScrollEnd]);

  // Calcular progreso general del grupo - siempre mostrar un valor
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
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
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
            selectedDelayLevels={selectedDelayLevels}
            projectSortField={projectSortField}
            sortOrder={sortOrder}
            onProjectTypesChange={handleProjectTypeFilter}
            onProjectStatusesChange={handleStatusFilter}
            onDelayLevelsChange={handleDelayLevelFilter}
            onSortChange={handleSortChange}
          />
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900">
          {/* Main Project Header */}
          <div className="mb-8">
            <div className="gap-4">
              <h2 className="font-bold text-gray-900 dark:text-gray-100">
                {projectGroup?.name || "Proyectos del Grupo"}
              </h2>
            </div>
            <div className="flex items-center gap-4 justify-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avance general del grupo</span>
            </div>

            {/* Overall Progress Bar - Siempre visible */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8 flex items-center relative overflow-hidden">
              <div
                className={`bg-primary h-full transition-all duration-300 ${
                  overallProgress === 100 ? "rounded-full" : "rounded-l-full"
                }`}
                style={{
                  width: `${Math.max(0, Math.min(100, overallProgress))}%`,
                  minWidth: overallProgress > 0 ? "2px" : "0",
                }}
              ></div>
              <span
                className="absolute left-1/2 transform -translate-x-1/2 text-lg font-semibold transition-colors duration-300 z-10 pointer-events-none"
                style={{
                  color: overallProgress > 45 ? "white" : undefined,
                }}
              >
                <span className={overallProgress > 45 ? "" : "text-gray-800 dark:text-gray-200"}>
                  {overallProgress}%
                </span>
              </span>
            </div>
          </div>
          {/* Loading State */}
          {isLoading && <ProjectsSkeleton count={8} />}
          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-destructive mb-2">{query.error?.error.userMessage}</div>
              <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
                Reintentar
              </Button>
            </div>
          )}
          {/* Projects Grid with Infinite Scroll */}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
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
                  <div className="flex flex-col items-center gap-3">
                    {inputValue ? (
                      <>
                        <Search className="h-12 w-12 text-muted-foreground/60" />
                        <div className="text-muted-foreground">No se encontraron proyectos con ese criterio</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setInputValue("");
                            handleInputChange("");
                          }}
                          className="mt-2"
                        >
                          Limpiar búsqueda
                        </Button>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="h-12 w-12 text-muted-foreground/60" />
                        <div className="text-muted-foreground">No hay proyectos en este grupo</div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Elemento invisible para detectar scroll infinito */}
              {hasNextPage && <div ref={loadMoreRef} className="h-4" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
