"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { ProjectFilterValues, ProjectsAdvancedSearch } from "@/app/(admin)/tracking/_components/ProjectsAdvancedSearch";
import { useProjectsPaginated } from "@/app/(admin)/tracking/_hooks/useProject";
import { useAuth } from "@/auth/presentation/providers/AuthProvider";
import AlertError from "@/shared/components/alerts/AlertError";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import ProjectCard from "./project-statusCard";

const ProjectStatusList = memo(function ProjectList() {
  const [filters, setFilters] = useState<ProjectFilterValues>({});
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth(); // ← obtiene el usuario autenticado

  const limit = isMobile ? 5 : 10;
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useProjectsPaginated(
    filters,
    limit
  );

  const projects = data?.pages.flatMap((page) => page.data) || [];
  const [isNearBottom, setIsNearBottom] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      setFilters((prev) => ({
        ...prev,
        clientId: user.id,
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (!loadingRef.current) return;

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
  }, [loadingRef.current]);

  useEffect(() => {
    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isNearBottom, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (newFilters: ProjectFilterValues) => {
    setFilters({
      ...newFilters,
      clientId: user?.id, // ← asegura que el filtro manual no borre el clientId
    });
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-4 h-full p-2">
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

export default ProjectStatusList;
