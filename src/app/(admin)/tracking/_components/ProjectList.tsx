"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { useDialogStore } from "@/shared/stores/useDialogStore";
import { useProjectsPaginated } from "../_hooks/useProject";
import ProjectCard from "./ProjectCard";
import { ProjectFilterValues, ProjectsAdvancedSearch } from "./ProjectsAdvancedSearch";

export default function ProjectList() {
  const { open } = useDialogStore();
  const [filters, setFilters] = useState<ProjectFilterValues>({});
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Usar la consulta paginada con InfiniteQuery con un límite de 10 elementos por página
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useProjectsPaginated(
    filters,
    10
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
  }, []);

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
    <div className="flex flex-col gap-4">
      <div className="flex justify-end items-center">
        <Button onClick={() => open("projects", "create")}>
          <Plus className="size-4 mr-2" />
          Agregar proyecto
        </Button>
      </div>

      <ProjectsAdvancedSearch onSearch={handleSearch} defaultValues={filters} />

      {isLoading && !isFetchingNextPage && (
        <div className="flex justify-center items-center my-8">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <p>Error: {(error as Error).message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
            Reintentar
          </Button>
        </div>
      )}

      {projects.length === 0 && !isLoading && (
        <div className="p-8 text-center border rounded-md bg-muted/10">
          <p className="text-muted-foreground">
            {Object.keys(filters).length > 0
              ? "No se encontraron proyectos con los filtros seleccionados"
              : "No hay proyectos disponibles"}
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div ref={listContainerRef} className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto">
          {projects.map((project) => {
            return <ProjectCard key={project.id} project={project} />;
          })}

          {/* Componente de carga que es detectado por Intersection Observer */}
          <div ref={loadingRef} className="py-4">
            {isFetchingNextPage && (
              <div className="flex justify-center items-center">
                <Loader2 className="size-5 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Cargando más proyectos...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
