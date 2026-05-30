const PRODUCTION_API_URL = "https://dental-clinic-f13d.onrender.com/api/v1";
const LOCAL_API_URL = "http://localhost:4000/api/v1";

const getApiUrl = (): string => {
  const envVal = process.env.NEXT_PUBLIC_API_URL;
  
  // If env var is set and valid, use it
  if (envVal && envVal !== "undefined" && envVal !== "null" && envVal.trim() !== "" && !envVal.includes("<")) {
    return envVal.replace(/^['"']|['"']$/g, '').replace(/\/$/, '');
  }
  
  // In browser: detect if we're running on Vercel/production (not localhost)
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return PRODUCTION_API_URL;
    }
  }
  
  return LOCAL_API_URL;
};

export const API_URL = getApiUrl();
