import { ApiClientConfig } from "../config/client.config";
import { ApiError, NetworkError, TimeoutError } from "../errors/api.error";
import { InterceptorManager } from "../interceptors/interceptor.manager";
import { withRetry } from "../utils/retry.util";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | boolean>;
  timeoutMs?: number;
  retries?: number;
}

export class HttpClient {
  public readonly interceptors = new InterceptorManager();

  constructor(private readonly config: ApiClientConfig) {}

  public async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const retries = options.retries ?? this.config.retries ?? 0;
    
    return withRetry(() => this.executeRequest<T>(path, options), retries);
  }

  private async executeRequest<T>(path: string, options: RequestOptions): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    let requestInit: RequestInit = {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...this.config.defaultHeaders,
        ...options.headers,
      },
    };

    if (options.body) {
      requestInit.body = JSON.stringify(options.body);
    }

    if (this.config.getToken) {
      const token = await this.config.getToken();
      if (token) {
        requestInit.headers = {
          ...requestInit.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    requestInit = await this.interceptors.runRequestInterceptors(requestInit);

    const timeoutMs = options.timeoutMs ?? this.config.timeoutMs ?? 10000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (options.signal) {
      options.signal.addEventListener("abort", () => controller.abort());
    }
    
    requestInit.signal = controller.signal;

    try {
      let response = await fetch(url.toString(), requestInit);
      clearTimeout(timeoutId);
      
      response = await this.interceptors.runResponseInterceptors(response);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = await response.text();
        }
        throw new ApiError(response.statusText, response.status, errorData);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
      }
      throw new NetworkError(error instanceof Error ? error.message : "Network request failed");
    }
  }

  public get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  public post<T>(path: string, options?: Omit<RequestOptions, "method">) {
    return this.request<T>(path, { ...options, method: "POST" });
  }

  public put<T>(path: string, options?: Omit<RequestOptions, "method">) {
    return this.request<T>(path, { ...options, method: "PUT" });
  }

  public delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}
