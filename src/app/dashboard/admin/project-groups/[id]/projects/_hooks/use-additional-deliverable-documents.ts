import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para obtener documentos de un entregable adicional
 */
export const useAdditionalDeliverableDocuments = (
  projectId: string,
  phaseId: string,
  additionalDeliverableId: string
) => {
  const query = backend.useQuery("get", "/v1/additional-documents", {
    params: {
      path: {
        projectId,
        phaseId,
        additionalDeliverableId,
      },
    },
    enabled: !!projectId && !!phaseId && !!additionalDeliverableId,
  });

  return { query };
};

/**
 * Hook para agregar documento a un entregable adicional
 */
export const useAddDocumentToAdditionalDeliverable = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("post", "/v1/additional-documents", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/additional-documents"],
      });
      queryClient.resetQueries({
        queryKey: [
          "get",
          "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/paginated",
        ],
      });
      toast.success("Documento agregado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para actualizar documento de un entregable adicional
 */
export const useUpdateAdditionalDocument = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("put", "/v1/additional-documents/{documentId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/additional-documents"],
      });
      queryClient.resetQueries({
        queryKey: [
          "get",
          "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/paginated",
        ],
      });
      toast.success("Documento actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};

/**
 * Hook para eliminar documento de un entregable adicional
 */
export const useDeleteAdditionalDocument = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("delete", "/v1/additional-documents/{documentId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["get", "/v1/additional-documents"],
      });
      queryClient.resetQueries({
        queryKey: [
          "get",
          "/v1/additional-deliverables/projects/{projectId}/phases/{phaseId}/additional-deliverables/paginated",
        ],
      });
      toast.success("Documento eliminado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error inesperado");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};
