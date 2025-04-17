"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import AlertError from "@/shared/components/alerts/AlertError";
import { Button } from "@/shared/components/ui/button";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useProjectsPaginated } from "../_hooks/useProject";
import ProjectCard from "./ProjectCard";
import { ProjectFilterValues, ProjectsAdvancedSearch } from "./ProjectsAdvancedSearch";

// Componente optimizado con memo para evitar re-renders innecesarios
const ProjectList = memo(function ProjectList() {
  const { open } = useDialogStore();
  const [filters, setFilters] = useState<ProjectFilterValues>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Usar la consulta paginada con InfiniteQuery con un límite adaptado según el dispositivo
  const limit = isMobile ? 5 : 10;
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useProjectsPaginated(
    filters,
    limit
  );

  // Aplanar los datos paginados en una sola lista de proyectos
  const projects = data?.pages.flatMap((page) => page.data) || [];
  // Estado para rastrear si estamos cerca del final
  const [isNearBottom, setIsNearBottom] = useState(false);

  // Referencia al observador de Intersection Observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Configurar Intersection Observer para detectar cuando estamos cerca del final
  useEffect(() => {
    if (!loadingRef.current) return;

    // Limpiar el observador anterior si existe
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsNearBottom(entry.isIntersecting);
      },
      {
        root: listContainerRef.current,
        threshold: 0.1,
      }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRef.current]); // Solo re-configurar cuando el elemento de referencia cambie

  // Cargar más proyectos cuando estamos cerca del final
  useEffect(() => {
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isNearBottom, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (newFilters: ProjectFilterValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-4 h-full p-2">
      <div className="flex justify-end items-center flex-shrink-0">
        <Button
          onClick={() => open("projects", "create")}
          size={isMobile ? "sm" : "default"}
          className="text-xs sm:text-sm h-8 sm:h-9"
        >
          <Plus className="size-3 sm:size-4 mr-1 sm:mr-2" />
          {isMobile ? "Agregar" : "Agregar proyecto"}
        </Button>
      </div>

      <ProjectsAdvancedSearch onSearch={handleSearch} defaultValues={filters} className="flex-shrink-0" />

      {isLoading && !isFetchingNextPage && (
        <div className="flex justify-center items-center my-2 sm:my-4 flex-shrink-0">
          <Loader2 className="size-5 sm:size-6 animate-spin text-primary" />
        </div>
      )}

      {error && <AlertError error={error} refetch={refetch} />}

      {projects.length === 0 && !isLoading && (
        <div className="p-3 sm:p-8 text-center border rounded-md bg-muted/10 flex-shrink-0 text-xs sm:text-sm">
          <p className="text-muted-foreground">
            {Object.keys(filters).length > 0
              ? "No se encontraron proyectos con los filtros seleccionados"
              : "No hay proyectos disponibles"}
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div ref={listContainerRef} className="flex-grow min-h-0 space-y-2 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2">
          {projects.map((project) => {
            return <ProjectCard key={project.id} project={project} />;
          })}

          {/* Componente de carga que es detectado por Intersection Observer */}
          <div ref={loadingRef} className="py-2 sm:py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center items-center">
                <Loader2 className="size-4 sm:size-5 animate-spin text-primary" />
                <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Cargando más proyectos...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProjectList;
