const browserOrigin = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.protocol}//${window.location.hostname}`;
};

export const API_URLS = {
  get user() {
    return process.env.NEXT_PUBLIC_USER_API_URL || `${browserOrigin()}:5000/api`;
  },
  get course() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || `${browserOrigin()}:5001/api`;
  },
  get purchase() {
    return (
      process.env.NEXT_PUBLIC_PURCHASE_API_URL ||
      `${browserOrigin()}:5002/api/purchase`
    );
  },
  get ai() {
    return process.env.NEXT_PUBLIC_AI_API_URL || `${browserOrigin()}:8000`;
  },
};
