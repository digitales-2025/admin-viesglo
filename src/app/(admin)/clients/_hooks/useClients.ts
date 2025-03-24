"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClient, deleteClient, getClients, updateClient } from "../_actions/clients.actions";
import { ClientCreate, ClientUpdate } from "../_types/clients.types";

export const CLIENTS_KEYS = {
  all: ["clients"] as const,
  lists: () => [...CLIENTS_KEYS.all, "list"] as const,
  list: (filters: string) => [...CLIENTS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CLIENTS_KEYS.all, id] as const,
};

/**
 * Hook para obtener todos los clientes
 */
export function useClients() {
  return useQuery({
    queryKey: CLIENTS_KEYS.lists(),
    queryFn: async () => {
      const response = await getClients();
      if (!response.success) {
        throw new Error(response.error || "Error al obtener clientes");
      }
      return response.data;
    },
  });
}

/**
 * Hook para crear un cliente
 */
export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (client: ClientCreate) => {
      const response = await createClient(client);
      if (!response.success) {
        throw new Error(response.error || "Error al crear cliente");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEYS.lists() });
      toast.success("Cliente creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear cliente");
    },
  });
}
/**
 * Hook para actualizar un cliente
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ClientUpdate> }) => {
      const updateData = { ...data };
      if (updateData.password === "") {
        const { password: _, ...rest } = updateData;
        const updateClientResponse = await updateClient(id, rest);
        if (!updateClientResponse.success) {
          throw new Error(updateClientResponse.error || "Error al actualizar cliente");
        }
        return updateClientResponse.data;
      }
      const updateClientResponse = await updateClient(id, updateData);
      if (!updateClientResponse.success) {
        throw new Error(updateClientResponse.error || "Error al actualizar cliente");
      }
      return updateClientResponse.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEYS.detail(variables.id) });
      toast.success("Cliente actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar cliente");
    },
  });
}
/**
 * Hook para eliminar un cliente
 */
export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteClient(id);
      if (!response.success) {
        throw new Error(response.error || "Error al eliminar cliente");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEYS.lists() });
      toast.success("Cliente eliminado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar cliente");
    },
  });
}
