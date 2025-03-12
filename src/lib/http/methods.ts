import { httpClient } from "./client";

/**
 * Métodos HTTP simplificados que utilizan el cliente HTTP unificado
 */
export const http = {
  /**
   * GET request
   */
  get: <T>(url: string, options = {}) => httpClient<T>(url, { method: "GET", ...options }),

  /**
   * POST request
   */
  post: <T>(url: string, data?: any, options = {}) =>
    httpClient<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  /**
   * PUT request
   */
  put: <T>(url: string, data?: any, options = {}) =>
    httpClient<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  /**
   * PATCH request
   */
  patch: <T>(url: string, data?: any, options = {}) =>
    httpClient<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    }),

  /**
   * DELETE request
   */
  delete: <T>(url: string, options = {}) => httpClient<T>(url, { method: "DELETE", ...options }),
};
