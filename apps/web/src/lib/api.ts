const PRODUCTION_API_URL = "https://dental-clinic-f13d.onrender.com/api/v1";
const LOCAL_API_URL = "http://localhost:4000/api/v1";

const getApiUrl = (): string => {
  // If we are in the browser on localhost, always force local API
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API_URL;
    }
  }

  const envVal = process.env.NEXT_PUBLIC_API_URL;
  
  // If env var is set and valid, use it
  if (envVal && envVal !== "undefined" && envVal !== "null" && envVal.trim() !== "" && !envVal.includes("<")) {
    return envVal.replace(/^['"']|['"']$/g, '').replace(/\/$/, '');
  }
  
  return PRODUCTION_API_URL;
};

export const API_URL = getApiUrl();

/**
 * Fetch wrapper that always returns a parsed object.
 * If the response body is not valid JSON (e.g. a rate-limit plain-text "Too many requests"),
 * it returns a structured error so callers can safely access `.success` and `.error`.
 */
export async function safeJsonFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<any> {
  const res = await fetch(input, init);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // Non-JSON body — surface as a standard error shape
    return {
      success: false,
      status: res.status,
      error: {
        code: res.status === 429 ? 'RATE_LIMIT_EXCEEDED' : 'UNEXPECTED_RESPONSE',
        message: text.trim() || `HTTP ${res.status}`,
      },
    };
  }
}
