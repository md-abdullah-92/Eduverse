const browserOrigin = () => "https://eduversebd.tech";

const apiBase = (path: string) => `${browserOrigin()}${path}`;

export const API_URLS = {
  get user() {
    return process.env.NEXT_PUBLIC_USER_API_URL || apiBase("/api");
  },
  get course() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || apiBase("/api");
  },
  get purchase() {
    return process.env.NEXT_PUBLIC_PURCHASE_API_URL || apiBase("/api/purchase");
  },
  get ai() {
    return process.env.NEXT_PUBLIC_AI_API_URL || "https://eduversebd.tech";
  },
};
