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

// Export fetchClient for binary file downloads and custom requests
export { fetchClient };

// ============================================================================
// 📥 BINARY FILE DOWNLOAD UTILITIES
// ============================================================================

/**
 * Configuration options for file downloads
 */
export interface DownloadOptions {
  /**
   * Custom filename for the downloaded file
   * If not provided, will try to extract from Content-Disposition header
   */
  filename?: string;

  /**
   * Whether to add timestamp to filename
   * @default false
   */
  addTimestamp?: boolean;

  /**
   * Success callback after download completes
   */
  onSuccess?: (filename: string) => void;

  /**
   * Error callback if download fails
   */
  onError?: (error: Error) => void;
}

/**
 * Extract filename from Content-Disposition header
 * Handles multiple formats: attachment; filename="file.xlsx", filename*=UTF-8''file.xlsx
 */
const extractFilenameFromHeader = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) return null;

  // Try filename*= (RFC 5987 - UTF-8 encoded)
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }

  // Try standard filename= with quotes
  const quotedMatch = contentDisposition.match(/filename="([^"]+)"/i);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  // Try filename= without quotes
  const unquotedMatch = contentDisposition.match(/filename=([^;]+)/i);
  if (unquotedMatch) {
    return unquotedMatch[1].trim();
  }

  return null;
};

/**
 * Generate filename with optional timestamp
 */
const generateFilename = (baseFilename: string, addTimestamp: boolean): string => {
  if (!addTimestamp) return baseFilename;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const lastDotIndex = baseFilename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return `${baseFilename}_${timestamp}`;
  }

  const name = baseFilename.slice(0, lastDotIndex);
  const extension = baseFilename.slice(lastDotIndex);
  return `${name}_${timestamp}${extension}`;
};

/**
 * Trigger browser download from blob
 */
const triggerDownload = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 📥 Generic file download from Response object
 *
 * Handles binary file downloads with automatic filename extraction,
 * blob creation, and browser download triggering.
 *
 * @param response - Fetch API Response object containing binary data
 * @param options - Download configuration options
 * @returns Filename of the downloaded file
 *
 * @example
 * ```ts
 * const response = await fetch("/v1/reports/project-efficiency");
 *
 * if (response.ok) {
 *   await downloadFile(response, {
 *     filename: "custom-name.xlsx",
 *     addTimestamp: true,
 *     onSuccess: (filename) => toast.success(`Downloaded: ${filename}`)
 *   });
 * }
 * ```
 */
export const downloadFile = async (response: Response, options: DownloadOptions = {}): Promise<string> => {
  try {
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get blob from response
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("Empty file received from server");
    }

    // Determine filename
    let filename = options.filename;
    if (!filename) {
      const headerFilename = extractFilenameFromHeader(response.headers.get("content-disposition"));
      filename = headerFilename || `download_${Date.now()}`;
    }

    // Add timestamp if requested
    filename = generateFilename(filename, options.addTimestamp ?? false);

    // Trigger download
    triggerDownload(blob, filename);

    // Call success callback
    options.onSuccess?.(filename);

    return filename;
  } catch (error) {
    const downloadError = error instanceof Error ? error : new Error("Unknown error during file download");

    options.onError?.(downloadError);
    throw downloadError;
  }
};

/**
 * 📥 Download file from blob directly
 *
 * Use this when you already have the blob parsed (e.g., from openapi-fetch with parseAs: "blob")
 *
 * @param blob - Blob object containing the file data
 * @param response - Response object for header extraction
 * @param options - Download configuration options
 * @returns Filename of the downloaded file
 *
 * @example
 * ```ts
 * const { data, response } = await fetchClient.GET("/v1/reports/project-efficiency", {
 *   parseAs: "blob"
 * });
 *
 * if (response.ok && data) {
 *   await downloadFromBlob(data, response, {
 *     filename: "reporte.xlsx",
 *     addTimestamp: true
 *   });
 * }
 * ```
 */
export const downloadFromBlob = async (
  blob: Blob,
  response: Response,
  options: DownloadOptions = {}
): Promise<string> => {
  try {
    if (blob.size === 0) {
      throw new Error("Empty file received from server");
    }

    // Determine filename
    let filename = options.filename;
    if (!filename) {
      const headerFilename = extractFilenameFromHeader(response.headers.get("content-disposition"));
      filename = headerFilename || `download_${Date.now()}`;
    }

    // Add timestamp if requested
    filename = generateFilename(filename, options.addTimestamp ?? false);

    // Trigger download
    triggerDownload(blob, filename);

    // Call success callback
    options.onSuccess?.(filename);

    return filename;
  } catch (error) {
    const downloadError = error instanceof Error ? error : new Error("Unknown error during file download");

    options.onError?.(downloadError);
    throw downloadError;
  }
};

/**
 * 📥 Download file from backend endpoint using openapi-fetch
 *
 * Wrapper around downloadFile that works directly with openapi-fetch client
 *
 * @param endpoint - API endpoint path
 * @param params - Query parameters for the endpoint
 * @param options - Download configuration options
 *
 * @example
 * ```ts
 * await downloadFromEndpoint(
 *   "/v1/reports/project-efficiency",
 *   { filters: { startDate: "2024-01-01" } },
 *   { addTimestamp: true }
 * );
 * ```
 */
export const downloadFromEndpoint = async <T extends keyof paths>(
  endpoint: T,
  params?: unknown,
  options: DownloadOptions = {}
): Promise<string> => {
  // Make request using fetchClient directly to get raw Response
  const response = await enhancedFetch(
    `${backendUrl(BACKEND_URL)}${endpoint}${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ""}`,
    { method: "GET" }
  );

  return downloadFile(response, options);
};
