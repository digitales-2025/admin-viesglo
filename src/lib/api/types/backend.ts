import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

import type { paths } from "./api";

// This is the result of the last optimized error management defined in the backend
export type FetchErrorResponse = {
  statusCode: number;
  message: string;
  error: unknown;
  id?: string;
  category?: string;
  severity?: string;
  timestamp?: string;
  path?: string;
  method?: string;
};

export type FetchError = typeof Error & FetchErrorResponse;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is not set");
}

const backendUrl = (baseUrl: string, version?: string) => {
  return version ? `${baseUrl}/${version}` : baseUrl;
};

/**
 * Custom fetch implementation that includes credentials and handles errors
 */
const enhancedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      credentials: "include",
    });
  } catch (e) {
    throw e;
    // throw {
    //     statusCode: 503,
    //     message: 'Servidor no disponible',
    //     error: e,
    // };
  }

  // if (!response.ok) {
  //     // const text = await response.text();

  //     // let parsedError;

  //     // // Try to parse as JSON, but fall back to plain text if it fails
  //     // try {
  //     //     parsedError = JSON.parse(text);

  //     //     // Check if it's the backend error format
  //     //     if (parsedError.success === false && parsedError.error) {
  //     //         const backendError = parsedError.error;
  //     //         throw {
  //     //             statusCode: backendError.statusCode || response.status,
  //     //             message: backendError.message || response.statusText,
  //     //             error: backendError,
  //     //             id: backendError.id,
  //     //             category: backendError.category,
  //     //             severity: backendError.severity,
  //     //             timestamp: backendError.timestamp,
  //     //             path: backendError.path,
  //     //             method: backendError.method,
  //     //         } as FetchError;
  //     //     }
  //     // } catch {
  //     //     // Not JSON, use the raw text
  //     //     parsedError = { rawText: text };
  //     // }

  //     // throw {
  //     //     statusCode: response.status,
  //     //     message: response.statusText,
  //     //     error: parsedError,
  //     // } as FetchError;

  //     throw response;
  // }

  return response;
};

/**
 * Client for connecting with the backend
 */
const fetchClient = createFetchClient<paths>({
  baseUrl: backendUrl(BACKEND_URL),
  fetch: enhancedFetch,
});

export const backend = createClient(fetchClient);
