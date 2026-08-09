export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs?: number;
  retries?: number;
  getToken?: () => string | null | Promise<string | null>;
  defaultHeaders?: Record<string, string>;
}
