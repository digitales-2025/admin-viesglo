import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";

/**
 * Hook para cambiar la contraseña de un usuario (admin)
 */
export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/auth/update-password", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/{id}"] });
      toast.success("Contraseña cambiada correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error al cambiar la contraseña");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};
