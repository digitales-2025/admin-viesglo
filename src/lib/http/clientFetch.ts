import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

interface FetchOptions extends Omit<AxiosRequestConfig, "url"> {
  skipAuth?: boolean;
}

// Crear instancia de axios con configuración base
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL,
  timeout: 5000,
  withCredentials: true,
  validateStatus: (status) => {
    // Consideramos 404 como válido durante el logout
    if (status === 404 && typeof window !== "undefined" && window.location.pathname === "/auth/sign-in") {
      return true;
    }
    return status >= 200 && status < 300;
  },
});

// Interceptores para logs
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.error("❌ Error en la configuración de la petición:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      console.error("❌ Error en la respuesta:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Función genérica para hacer peticiones
async function clientFetch<T>(path: string, options: FetchOptions = {}): Promise<{ data: T; headers: any }> {
  try {
    const response = await api.request({
      url: path,
      ...options,
      headers: {
        ...options.headers,
        Accept: "application/json",
      },
    });

    // Devolvemos tanto los datos como los headers
    return {
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || error.message);
    }
    throw error;
  }
}

// Métodos helper para mayor comodidad
export const http = {
  get: <T>(path: string, options?: Omit<FetchOptions, "method" | "data">) =>
    clientFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: any, options?: Omit<FetchOptions, "method" | "data">) =>
    clientFetch<T>(path, {
      ...options,
      method: "POST",
      data: body,
    }),

  put: <T>(path: string, body?: any, options?: Omit<FetchOptions, "method" | "data">) =>
    clientFetch<T>(path, {
      ...options,
      method: "PUT",
      data: body,
    }),

  delete: <T>(path: string, options?: Omit<FetchOptions, "method" | "data">) =>
    clientFetch<T>(path, { ...options, method: "DELETE" }),
};
