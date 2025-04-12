/**
 * Utility function for making API requests
 * @param method HTTP method
 * @param url API endpoint
 * @param data Request body (for POST, PUT, PATCH)
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const response = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  return response;
}

/**
 * Handles error responses from API requests
 * @param error Error object
 * @returns Formatted error message
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

/**
 * Check if an API response is OK
 * @param response Fetch response
 * @throws Error with status and message if response is not OK
 */
export async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }
}

/**
 * Parse JSON from a response, with error handling
 * @param response Fetch response
 * @returns Parsed JSON data
 */
export async function parseJsonResponse<T>(response: Response): Promise<T> {
  await checkResponse(response);
  return response.json() as Promise<T>;
}
