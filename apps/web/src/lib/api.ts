const getApiUrl = () => {
  const envVal = process.env.NEXT_PUBLIC_API_URL;
  if (!envVal || envVal === "undefined" || envVal === "null" || envVal.trim() === "") {
    return "http://localhost:4000/api/v1";
  }
  // Strip wrapping double or single quotes
  return envVal.replace(/^['"]|['"]$/g, '');
};

export const API_URL = getApiUrl();
