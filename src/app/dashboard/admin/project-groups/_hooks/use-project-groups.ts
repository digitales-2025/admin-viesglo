import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { usePagination } from "@/shared/hooks/use-pagination";

/**
 * Hook principal para gestionar grupos de proyectos
 *
 * Características:
 * - Paginación automática con estado persistente
 * - Búsqueda por nombre (opcional)
 * - Cache inteligente para evitar consultas innecesarias
 * - Reinicio automático a página 1 al buscar
 */
export const useProjectGroups = () => {
  const { page, size, setPagination, resetPagination } = usePagination();
  const [search, setSearch] = useState<string>("");

  const query = backend.useQuery(
    "get",
    "/v1/project-groups/paginated",
    {
      params: {
        query: {
          page,
          pageSize: size,
          ...(search ? { search } : {}),
        },
      },
    },
    {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    }
  );

  const applySearch = (term: string) => {
    // Reinicia a la primera página cuando se aplica una nueva búsqueda
    setPagination({ newPage: 1, newSize: size });
    setSearch(term);
  };

  return {
    query,
    setPagination,
    resetPagination,
    applySearch,
    currentSearch: search,
    page,
    size,
    refetch: query.refetch,
  };
};

/**
 * Hook infinito para listar grupos de proyectos con paginación por scroll
 */
export const useProjectGroupsInfinite = () => {
  const { size } = usePagination();
  const [search, setSearch] = useState<string | undefined>(undefined);

  const query = backend.useInfiniteQuery(
    "get",
    "/v1/project-groups/paginated",
    {
      params: {
        query: {
          page: 1, // reemplazado por pageParam
          pageSize: size,
          // Agregamos un parámetro único para evitar colisiones de caché con useQuery
          viewMode: "cards" as any,
          ...(search ? { search } : {}),
        },
      },
    },
    {
      initialPageParam: 1,
      pageParamName: "page",
      // Defensas: si la respuesta no trae meta, no intentamos paginar
      getNextPageParam: (lastPage: any) => {
        const meta = lastPage?.meta;
        if (!meta || typeof meta.page !== "number" || typeof meta.totalPages !== "number") return undefined;
        return meta.page < meta.totalPages ? meta.page + 1 : undefined;
      },
      getPreviousPageParam: (firstPage: any) => {
        const meta = firstPage?.meta;
        if (!meta || typeof meta.page !== "number") return undefined;
        return meta.page > 1 ? meta.page - 1 : undefined;
      },
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    }
  );

  const allGroups = query.data?.pages?.flatMap((p: any) => p?.data ?? []) ?? [];

  return {
    query,
    allGroups,
    search,
    setSearch,
    refetch: query.refetch,
  };
};

/**
 * Hook para obtener todos los grupos de proyectos activos (no paginado)
 */
export const useAllActiveProjectGroups = () => {
  return backend.useQuery("get", "/v1/project-groups", {}, {});
};

/**
 * Hook para obtener grupo de proyectos por ID
 */
export const useProjectGroupById = (projectGroupId: string, enabled = true) => {
  return backend.useQuery(
    "get",
    "/v1/project-groups/{id}",
    {
      params: {
        path: { id: projectGroupId },
      },
    },
    {
      enabled: !!projectGroupId && enabled,
    }
  );
};

/**
 * Hook para crear grupo de proyectos con isSuccess incluido
 */
export const useCreateProjectGroup = () => {
  const queryClient = useQueryClient();

  const mutation = backend.useMutation("post", "/v1/project-groups", {
    onSuccess: () => {
      // Invalidar todas las consultas y forzar refetch
      queryClient.invalidateQueries();
      // También invalidar específicamente las consultas de project-groups
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      toast.success("Grupo de proyectos creado correctamente");
    },
    onError: (error: any) => {
      console.error("Error creating project group:", error);
      const message = (error?.message as string) || "Ocurrió un error inesperado";
      toast.error(message);
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar grupo de proyectos con isSuccess incluido
 */
export const useUpdateProjectGroup = () => {
  const queryClient = useQueryClient();

  const mutation = backend.useMutation("patch", "/v1/project-groups/{id}", {
    onSuccess: (_data, variables) => {
      const id = variables?.params?.path?.id;
      // Invalidar todas las consultas y forzar refetch
      queryClient.invalidateQueries();
      // También invalidar específicamente las consultas de project-groups
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["project-groups", id] });
      toast.success("Grupo de proyectos actualizado correctamente");
    },
    onError: (error: any) => {
      const message = (error?.message as string) || "Ocurrió un error inesperado";
      toast.error(message);
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar grupo de proyectos
 */
export const useDeleteProjectGroup = () => {
  const queryClient = useQueryClient();

  return backend.useMutation("delete", "/v1/project-groups/{id}", {
    onSuccess: () => {
      // Invalidar todas las consultas y forzar refetch
      queryClient.invalidateQueries();
      // También invalidar específicamente las consultas de project-groups
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      toast.success("Grupo de proyectos eliminado correctamente");
    },
    onError: (error: any) => {
      const message = (error?.message as string) || "Ocurrió un error inesperado";
      toast.error(message);
    },
  });
};

/**
 * Hook para reactivar grupo de proyectos
 */
export const useReactivateProjectGroup = () => {
  const queryClient = useQueryClient();

  return backend.useMutation("patch", "/v1/project-groups/{id}/reactivate", {
    onSuccess: () => {
      // Invalidar todas las consultas y forzar refetch
      queryClient.invalidateQueries();
      // También invalidar específicamente las consultas de project-groups
      queryClient.invalidateQueries({ queryKey: ["project-groups"] });
      toast.success("Grupo de proyectos reactivado correctamente");
    },
    onError: (error: any) => {
      const message = (error?.message as string) || "Ocurrió un error inesperado";
      toast.error(message);
    },
  });
};

/**
 * Hook para obtener proyectos de un grupo específico
 */
export const useProjectsOfGroup = (projectGroupId: string, enabled = true) => {
  return backend.useQuery(
    "get",
    "/v1/project-groups/{id}/projects",
    {
      params: {
        path: { id: projectGroupId },
      },
    },
    {
      enabled: !!projectGroupId && enabled,
    }
  );
};
