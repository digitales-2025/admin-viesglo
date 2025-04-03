"use server";

import { http } from "@/lib/http/serverFetch";
import {
  CreateProject,
  ProjectFilters,
  ProjectPaginationResponse,
  ProjectResponse,
  UpdateProjectWithoutServices,
} from "../_types/tracking.types";

const API_ENDPOINT = "/projects";

/**
 * Obtiene todos los proyectos
 */
export async function getProjects(): Promise<{ data: ProjectResponse[]; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectResponse[]>(API_ENDPOINT);
    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener proyectos" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener proyectos", error);
    return { success: false, data: [], error: "Error al obtener proyectos" };
  }
}

/**
 * Obtiene un proyecto por su ID
 */
export async function getProject(
  id: string
): Promise<{ data: ProjectResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.get<ProjectResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al obtener proyecto" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener proyecto", error);
    return { success: false, data: null, error: "Error al obtener proyecto" };
  }
}

/**
 * Crea un nuevo proyecto
 */
export async function createProject(
  project: CreateProject
): Promise<{ data: ProjectResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.post<ProjectResponse>(API_ENDPOINT, project);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al crear proyecto" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al crear proyecto", error);
    return { success: false, data: null, error: "Error al crear proyecto" };
  }
}

/**
 * Actualiza un proyecto existente
 */
export async function updateProject(
  id: string,
  project: UpdateProjectWithoutServices
): Promise<{ data: ProjectResponse | null; success: boolean; error?: string }> {
  try {
    const [data, err] = await http.put<ProjectResponse>(`${API_ENDPOINT}/${id}`, project);
    if (err !== null) {
      return { success: false, data: null, error: err.message || "Error al actualizar proyecto" };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error al actualizar proyecto", error);
    return { success: false, data: null, error: "Error al actualizar proyecto" };
  }
}

/**
 * Elimina un proyecto existente
 */
export async function deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const [_, err] = await http.delete<ProjectResponse>(`${API_ENDPOINT}/${id}`);
    if (err !== null) {
      return { success: false, error: err.message || "Error al eliminar proyecto" };
    }
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar proyecto", error);
    return { success: false, error: "Error al eliminar proyecto" };
  }
}

/**
 * Obtiene los proyectos segun filtros
 */
export async function getProjectsByFilters(
  filters: ProjectFilters
): Promise<{ data: ProjectResponse[]; success: boolean; error?: string }> {
  try {
    // Procesar y validar los filtros antes de añadirlos a la URL
    const processedFilters: Record<string, string> = {};

    // Función auxiliar para procesar y validar fechas
    const processDate = (dateStr: string | undefined, fieldName: string): string | null => {
      if (!dateStr) return null;

      try {
        // Intentar parsear la fecha
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid ${fieldName} format:`, dateStr);
          return null;
        }

        // Devolver en formato YYYY-MM-DD
        return date.toISOString().split("T")[0];
      } catch (e) {
        console.warn(`Error processing ${fieldName}:`, e);
        return null;
      }
    };

    // Procesar tipos de contrato y proyecto (string)
    if (filters.typeContract) processedFilters.typeContract = filters.typeContract;
    if (filters.typeProject) processedFilters.typeProject = filters.typeProject;

    // Procesar fechas de inicio
    const startDateFrom = processDate(filters.startDateFrom, "startDateFrom");
    const startDateTo = processDate(filters.startDateTo, "startDateTo");

    if (startDateFrom) processedFilters.startDateFrom = startDateFrom;
    if (startDateTo) processedFilters.startDateTo = startDateTo;

    // Procesar fechas de finalización
    const endDateFrom = processDate(filters.endDateFrom, "endDateFrom");
    const endDateTo = processDate(filters.endDateTo, "endDateTo");

    if (endDateFrom) processedFilters.endDateFrom = endDateFrom;
    if (endDateTo) processedFilters.endDateTo = endDateTo;

    // Procesar estado (string)
    if (filters.status) processedFilters.status = filters.status;

    // Procesar búsqueda (string)
    if (filters.search) processedFilters.search = filters.search;

    // Procesar ID de cliente (string)
    if (filters.clientId) processedFilters.clientId = filters.clientId;

    // Procesar isActive (boolean)
    if (filters.isActive !== undefined && filters.isActive !== null && filters.isActive !== "") {
      // Convertir a boolean explícitamente
      const isActiveBoolean = filters.isActive === "true";
      processedFilters.isActive = isActiveBoolean.toString();
    }

    // URL final con los parámetros de consulta
    const url = `${API_ENDPOINT}/search?${new URLSearchParams(processedFilters).toString()}`;

    // Realizar la petición
    const [data, err] = await http.get<ProjectResponse[]>(url);

    if (err !== null) {
      return { success: false, data: [], error: err.message || "Error al obtener proyectos" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error al obtener proyectos", error);
    return { success: false, data: [], error: "Error al obtener proyectos" };
  }
}

/**
 * Obtiene proyectos paginados según filtros
 */
export async function getProjectsPaginated(
  filters: ProjectFilters,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: ProjectPaginationResponse | null;
  success: boolean;
  error?: string;
}> {
  try {
    // URL base
    const baseUrl = `${API_ENDPOINT}/search/paginated`;

    // Crear la URL con los parámetros de consulta específicos
    const queryParams = [];

    // Primero añadimos los parámetros de paginación
    queryParams.push(`page=${encodeURIComponent(page)}`);
    queryParams.push(`limit=${encodeURIComponent(limit)}`);

    // Procesar y validar los filtros antes de añadirlos a la URL
    // Solo enviaremos los filtros que tengan un valor y estén correctamente formateados
    const processedFilters: Record<string, string> = {};

    // Función auxiliar para procesar y validar fechas
    const processDate = (dateStr: string | undefined, fieldName: string): string | null => {
      if (!dateStr) return null;

      try {
        // Intentar parsear la fecha
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn(`Invalid ${fieldName} format:`, dateStr);
          return null;
        }

        // Devolver en formato YYYY-MM-DD
        return date.toISOString().split("T")[0];
      } catch (e) {
        console.warn(`Error processing ${fieldName}:`, e);
        return null;
      }
    };

    // Procesar tipos de contrato y proyecto (string)
    if (filters.typeContract) processedFilters.typeContract = filters.typeContract;
    if (filters.typeProject) processedFilters.typeProject = filters.typeProject;

    // Procesar fechas de inicio
    const startDateFrom = processDate(filters.startDateFrom, "startDateFrom");
    const startDateTo = processDate(filters.startDateTo, "startDateTo");

    if (startDateFrom) processedFilters.startDateFrom = startDateFrom;
    if (startDateTo) processedFilters.startDateTo = startDateTo;

    // Procesar fechas de finalización
    const endDateFrom = processDate(filters.endDateFrom, "endDateFrom");
    const endDateTo = processDate(filters.endDateTo, "endDateTo");

    if (endDateFrom) processedFilters.endDateFrom = endDateFrom;
    if (endDateTo) processedFilters.endDateTo = endDateTo;

    // Procesar estado (string)
    if (filters.status) processedFilters.status = filters.status;

    // Procesar búsqueda (string)
    if (filters.search) processedFilters.search = filters.search;

    // Procesar ID de cliente (string)
    if (filters.clientId) processedFilters.clientId = filters.clientId;

    // Procesar isActive (boolean)
    if (filters.isActive !== undefined && filters.isActive !== null && filters.isActive !== "") {
      // Convertir a boolean explícitamente
      const isActiveBoolean = filters.isActive === "true";
      processedFilters.isActive = isActiveBoolean.toString();
    }

    // Añadir los filtros procesados a los parámetros de consulta
    Object.entries(processedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    });

    // URL final
    const url = `${baseUrl}?${queryParams.join("&")}`;

    // Realizar la petición
    const [data, err] = await http.get<ProjectPaginationResponse>(url);

    if (err !== null) {
      return {
        data: null,
        success: false,
        error: err.message || "Error al obtener proyectos paginados",
      };
    }

    return {
      data,
      success: true,
    };
  } catch (error) {
    console.error("Error al obtener proyectos paginados", error);
    return {
      data: null,
      success: false,
      error: "Error al obtener proyectos paginados",
    };
  }
}
