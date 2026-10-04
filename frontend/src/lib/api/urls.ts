const browserOrigin = () => "https://eduversebd.tech";

const apiBase = (path: string) => `${browserOrigin()}${path}`;

const browserApiUrl = (port: number) => {
  return `${browserOrigin()}:${port}/api`;
};

export const API_URLS = {
  get user() {
<<<<<<< HEAD
    return process.env.NEXT_PUBLIC_USER_API_URL || apiBase("/api");
  },
  get course() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || apiBase("/api");
=======
    return process.env.NEXT_PUBLIC_USER_API_URL || browserApiUrl(5000);
  },
  get course() {
    return process.env.NEXT_PUBLIC_API_BASE_URL || browserApiUrl(5001);
>>>>>>> 3276608 (update the url)
  },
  get purchase() {
    return process.env.NEXT_PUBLIC_PURCHASE_API_URL || apiBase("/api/purchase");
  },
  get ai() {
    return process.env.NEXT_PUBLIC_AI_API_URL || "https://eduversebd.tech";
  },
};
