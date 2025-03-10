import { httpClient } from "./client";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

function createRequest<T>(method: HttpMethod) {
  return (url: string, options: RequestOptions = {}) => httpClient<T>(url, { ...options, method });
}

function createRequestWithData<T, D = unknown>(method: HttpMethod) {
  return (url: string, data?: D, options: RequestOptions = {}) =>
    httpClient<T>(url, {
      ...options,
      method,
      body: data ? JSON.stringify(data) : undefined,
    });
}

export const http = {
  get: createRequest<any>("GET"),
  delete: createRequest<any>("DELETE"),
  post: createRequestWithData<any, any>("POST"),
  put: createRequestWithData<any, any>("PUT"),
  patch: createRequestWithData<any, any>("PATCH"),
};
