import { useQueryClient } from "@tanstack/react-query";

import { backend } from "@/lib/api/types/backend";

// Recursos activos (para el select)
export const useActiveResources = () => {
  return backend.useQuery("get", "/v1/resources", {}, { staleTime: 60_000 });
};

// Listar recursos por hito
export const useMilestoneResources = (projectId: string, milestoneId: string, enabled = true) => {
  return backend.useQuery(
    "get",
    "/v1/projects/{projectId}/milestones/{milestoneId}/milestone-resources",
    {
      params: { path: { projectId, milestoneId } },
    },
    { enabled: !!projectId && !!milestoneId && enabled, staleTime: 10_000 }
  );
};

// Crear recurso por hito
export const useCreateMilestoneResource = () => {
  const qc = useQueryClient();
  return backend.useMutation("post", "/v1/projects/{projectId}/milestones/{milestoneId}/milestone-resources", {
    onSuccess: (_data, variables: any) => {
      const { projectId, milestoneId } = variables?.params?.path ?? {};
      qc.invalidateQueries();
      if (projectId && milestoneId) {
        qc.invalidateQueries({ queryKey: ["projects", projectId, "milestones", milestoneId, "resources"] });
      }
    },
  });
};

// Actualizar recurso por hito
export const useUpdateMilestoneResource = () => {
  const qc = useQueryClient();
  return backend.useMutation("patch", "/v1/projects/{projectId}/milestones/{milestoneId}/milestone-resources/{id}", {
    onSuccess: (_data, variables: any) => {
      const { projectId, milestoneId } = variables?.params?.path ?? {};
      qc.invalidateQueries();
      if (projectId && milestoneId) {
        qc.invalidateQueries({ queryKey: ["projects", projectId, "milestones", milestoneId, "resources"] });
      }
    },
  });
};

// Eliminar recurso por hito
export const useDeleteMilestoneResource = () => {
  const qc = useQueryClient();
  return backend.useMutation("delete", "/v1/projects/{projectId}/milestones/{milestoneId}/milestone-resources/{id}", {
    onSuccess: (_data, variables: any) => {
      const { projectId, milestoneId } = variables?.params?.path ?? {};
      qc.invalidateQueries();
      if (projectId && milestoneId) {
        qc.invalidateQueries({ queryKey: ["projects", projectId, "milestones", milestoneId, "resources"] });
      }
    },
  });
};
