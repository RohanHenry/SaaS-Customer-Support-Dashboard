/**
 * Tiny, reusable API client for talking to the SupportFlow backend.
 *
 * We centralize fetch logic here so every page/component calls the API the same
 * way (same base URL, same JSON handling, same error shape). In later phases this
 * file grows to attach auth cookies and typed helpers per resource.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function apiFetch<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    // `credentials: include` sends/receives the auth cookie we add in Phase 3.
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Try to read a JSON error message, fall back to the status text.
    const message = await response
      .json()
      .then((data) => data.message as string)
      .catch(() => response.statusText);
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<TResponse>;
}

/** Shape returned by GET /api/health */
export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export function getHealth() {
  return apiFetch<HealthResponse>("/api/health");
}
