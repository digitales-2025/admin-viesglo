"use server";

import { http } from "@/lib/http/serverFetch";
import { ClientCreate, ClientResponse, ClientUpdate, ClientWithClinicResponse } from "../_types/clients.types";

const API_ENDPOINT = "/clients";

/**
 * Obtiene todos los clientes
 */
export async function getClients(): Promise<{ data: ClientWithClinicResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ClientWithClinicResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener clientes" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener clientes", error);
    return { success: false, data: [], error: "Error al obtener clientes" };
  }
}

/**
 * Obtiene un cliente por su ID
 */
export async function getClient(
  id: string
): Promise<{ data: ClientResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ClientResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener cliente" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener cliente", error);
    return { success: false, data: null, error: "Error al obtener cliente" };
  }
}

/**
 * Busca un cliente por su RUC
 */
export async function getClientByRuc(
  ruc: string
): Promise<{ data: ClientResponse | null; success: boolean; error?: string }> {
  try {
    // Como no hay un endpoint específico para búsqueda por RUC,
    // usamos la función de búsqueda y luego filtramos por RUC exacto
    const searchResponse = await searchClients(ruc);

    if (!searchResponse.success) {
      return { success: false, data: null, error: searchResponse.error || "Error al buscar cliente por RUC" };
    }

    // Filtramos el cliente que coincida exactamente con el RUC
    const clientFound = searchResponse.data.find((client) => client.ruc === ruc);

    if (!clientFound) {
      return { success: true, data: null }; // No es un error, simplemente no se encontró
    }

    return { success: true, data: clientFound };
  } catch (error) {
    console.error("Error al buscar cliente por RUC", error);
    return { success: false, data: null, error: "Error al buscar cliente por RUC" };
  }
}

/**
 * Crea un nuevo cliente
 */
export async function createClient(
  client: ClientCreate
): Promise<{ data: ClientResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ClientResponse>(API_ENDPOINT, client);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear cliente" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear cliente", error);
    return { success: false, data: null, error: "Error al crear cliente" };
  }
}

/**
 * Actualiza un cliente existente
 */
export async function updateClient(
  id: string,
  client: ClientUpdate
): Promise<{ data: ClientResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ClientResponse>(`${API_ENDPOINT}/${id}`, client);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar cliente" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar cliente", error);
    return { success: false, data: null, error: "Error al actualizar cliente" };
  }
}

/**
 * Elimina un cliente existente
 */
export async function deleteClient(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar cliente" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar cliente", error);
    return { success: false, error: "Error al eliminar cliente" };
  }
}

/**
 * buscar clientes por un filtro (nombre, email, rut)
 */
export async function searchClients(
  filter: string
): Promise<{ data: ClientResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ClientResponse[]>(`${API_ENDPOINT}/search?filter=${filter}`);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al buscar clientes" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al buscar clientes", error);
    return { success: false, data: [], error: "Error al buscar clientes" };
  }
}
