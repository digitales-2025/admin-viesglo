import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para obtener documentos de un entregable
 */
export const useDeliverableDocuments = (projectId: string, phaseId: string, deliverableId: string) => {
  const query = backend.useQuery(
    "get",
    "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents",
    {
      params: {
        path: {
          projectId,
          phaseId,
          deliverableId,
        },
      },
      enabled: !!projectId && !!phaseId && !!deliverableId,
    }
  );

  return { query };
};

/**
 * Hook para agregar documento a un entregable
 */
export const useAddDocumentToDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "post",
    "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents",
          ],
        });
        queryClient.resetQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Documento agregado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar documento de un entregable
 */
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "put",
    "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents/{documentId}",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents",
          ],
        });
        queryClient.resetQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Documento actualizado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar documento de un entregable
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation(
    "delete",
    "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents/{documentId}",
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "get",
            "/v1/project-deliverable-documents/projects/{projectId}/phases/{phaseId}/deliverables/{deliverableId}/documents",
          ],
        });
        queryClient.resetQueries({
          queryKey: ["get", "/v1/project-deliverables/projects/{projectId}/phases/{phaseId}/deliverables/paginated"],
        });
        toast.success("Documento eliminado correctamente");
      },
      onError: (error) => {
        toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
      },
    }
  );

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};
