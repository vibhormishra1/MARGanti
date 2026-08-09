const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const httpClient = {
  get: async <T>(url: string): Promise<{ data: T }> => {
    const res = await fetch(`${BASE_URL}${url}`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return { data };
  },
  post: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return { data };
  },
  put: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return { data };
  },
  delete: async <T>(url: string): Promise<{ data: T }> => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    return { data };
  },
};
