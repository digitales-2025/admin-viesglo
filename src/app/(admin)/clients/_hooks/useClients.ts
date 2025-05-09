"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createClient,
  deleteClient,
  getClient,
  getClientByRuc,
  getClients,
  searchClients,
  toggleClientActive,
  updateClient,
} from "../_actions/clients.actions";
import { ClientCreate, ClientUpdate } from "../_types/clients.types";

export const CLIENTS_KEYS = {
  all: ["clients"] as const,
  lists: () => [...CLIENTS_KEYS.all, "list"] as const,
  list: (filters: string) => [...CLIENTS_KEYS.lists(), { filters }] as const,
  detail: (id: string) => [...CLIENTS_KEYS.all, id] as const,
  search: (filter: string) => [...CLIENTS_KEYS.all, "search", filter] as const,
  byRuc: (ruc: string) => [...CLIENTS_KEYS.all, "ruc", ruc] as const,
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
 * Hook para obtener un cliente por ID
 */
export function useClient(id: string) {
  return useQuery({
    queryKey: CLIENTS_KEYS.detail(id),
    queryFn: async () => {
      const response = await getClient(id);
      if (!response.success) {
        throw new Error(response.error || "Error al obtener cliente");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook para buscar un cliente por RUC
 */
export function useClientByRuc(ruc: string) {
  return useQuery({
    queryKey: CLIENTS_KEYS.byRuc(ruc),
    queryFn: async () => {
      const response = await getClientByRuc(ruc);
      if (!response.success) {
        throw new Error(response.error || "Error al buscar cliente por RUC");
      }
      return response.data;
    },
    enabled: !!ruc,
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

/**
 * Hook para toggle active el cliente
 */
export function useToggleActiveClients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await toggleClientActive(id);
      if (!response.success) {
        throw new Error(response.error || "Error al activar/desactivar cliente");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLIENTS_KEYS.lists() });
      toast.success("Cliente activado/desactivado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al activar/desactivar cliente");
    },
  });
}

/**
 * Hook para buscar clientes (nombre, email, ruc)
 */
export function useSearchClients(filter: string) {
  return useQuery({
    queryKey: CLIENTS_KEYS.search(filter),
    queryFn: async () => {
      const response = await searchClients(filter);
      if (!response.success) {
        throw new Error(response.error || "Error al buscar clientes");
      }
      return response.data;
    },
  });
}
