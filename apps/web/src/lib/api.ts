const PRODUCTION_API_URL = "https://dental-clinic-f13d.onrender.com/api/v1";
const LOCAL_API_URL = "http://localhost:4000/api/v1";

/** Lazily compute the API URL so it always reads the runtime browser context */
export function getApiUrl(): string {
  // In the browser: use hostname to choose local vs. production
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API_URL;
    }
  }

  const envVal = process.env.NEXT_PUBLIC_API_URL;

  // If env var is set and valid, use it
  if (
    envVal &&
    envVal !== "undefined" &&
    envVal !== "null" &&
    envVal.trim() !== "" &&
    !envVal.includes("<")
  ) {
    return envVal.replace(/^['"]|['"]$/g, "").replace(/\/$/, "");
  }

  return PRODUCTION_API_URL;
}

/** Stable module-level constant (safe to use in "use client" components after hydration) */
export const API_URL = getApiUrl();

/**
 * Fetch wrapper that always returns a parsed object.
 * - Adds a 20-second timeout so requests don't hang forever (Render.com cold starts).
 * - If the response body is not valid JSON, it returns a structured error.
 * - Callers can safely access `.success` and `.error`.
 */
export async function safeJsonFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = 20000
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    clearTimeout(timer);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      // Non-JSON body — surface as a standard error shape
      return {
        success: false,
        status: res.status,
        error: {
          code: res.status === 429 ? "RATE_LIMIT_EXCEEDED" : "UNEXPECTED_RESPONSE",
          message: text.trim() || `HTTP ${res.status}`,
        },
      };
    }
  } catch (err: any) {
    clearTimeout(timer);
    const isTimeout = err?.name === "AbortError";
    return {
      success: false,
      status: isTimeout ? 408 : 0,
      error: {
        code: isTimeout ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
        message: isTimeout
          ? "The server is waking up (cold start). Please wait a moment and try again."
          : err?.message || "Network error",
      },
    };
  }
}

/**
 * Retry a safeJsonFetch call with exponential backoff.
 * Useful for cold-start scenarios where the first request may time out.
 *
 * @param fn - An async function that calls safeJsonFetch and returns the result
 * @param maxRetries - How many times to retry (default 2)
 * @param baseDelayMs - Initial delay before first retry in ms (default 3000)
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 3000
): Promise<T> {
  let lastResult: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, baseDelayMs * attempt));
    }
    const result = await fn();
    lastResult = result;
    // If success or not a timeout/network error, return immediately
    if ((result as any)?.success) return result;
    const code = (result as any)?.error?.code;
    if (code !== "REQUEST_TIMEOUT" && code !== "NETWORK_ERROR") return result;
  }
  return lastResult;
}
