const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
import { telemetry } from "./telemetry";

export const httpClient = {
  _headers: {} as Record<string, string>,
  setHeader(key: string, value: string) {
    this._headers[key] = value;
  },
  removeHeader(key: string) {
    delete this._headers[key];
  },
  get: async <T>(url: string): Promise<{ data: T }> => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        headers: { ...httpClient._headers },
      });
      telemetry.trackApiCall("GET", url, performance.now() - start, res.status, !res.ok);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return { data };
    } catch (err) {
      telemetry.trackApiCall("GET", url, performance.now() - start, 0, true);
      throw err;
    }
  },
  post: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...httpClient._headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      telemetry.trackApiCall("POST", url, performance.now() - start, res.status, !res.ok);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return { data };
    } catch (err) {
      telemetry.trackApiCall("POST", url, performance.now() - start, 0, true);
      throw err;
    }
  },
  put: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...httpClient._headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      telemetry.trackApiCall("PUT", url, performance.now() - start, res.status, !res.ok);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return { data };
    } catch (err) {
      telemetry.trackApiCall("PUT", url, performance.now() - start, 0, true);
      throw err;
    }
  },
  patch: async <T>(url: string, body?: any): Promise<{ data: T }> => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...httpClient._headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      telemetry.trackApiCall("PATCH", url, performance.now() - start, res.status, !res.ok);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return { data };
    } catch (err) {
      telemetry.trackApiCall("PATCH", url, performance.now() - start, 0, true);
      throw err;
    }
  },
  delete: async <T>(url: string): Promise<{ data: T }> => {
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}${url}`, {
        method: "DELETE",
        headers: { ...httpClient._headers },
      });
      telemetry.trackApiCall("DELETE", url, performance.now() - start, res.status, !res.ok);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      return { data };
    } catch (err) {
      telemetry.trackApiCall("DELETE", url, performance.now() - start, 0, true);
      throw err;
    }
  },
};
