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

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const mutation = backend.useMutation("patch", "/v1/auth/profile", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/users/{id}"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/auth/me"] });
      toast.success("Perfil actualizado correctamente");
    },
    onError: (error) => {
      toast.error(error?.error?.userMessage || "Ocurrió un error al actualizar el perfil");
    },
  });

  return {
    ...mutation,
    isSuccess: mutation.isSuccess,
  };
};
