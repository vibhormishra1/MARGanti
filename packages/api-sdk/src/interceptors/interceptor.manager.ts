export type RequestInterceptor = (request: RequestInit) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>;

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  public async runRequestInterceptors(request: RequestInit): Promise<RequestInit> {
    let currentReq = { ...request };
    for (const interceptor of this.requestInterceptors) {
      currentReq = await interceptor(currentReq);
    }
    return currentReq;
  }

  public async runResponseInterceptors(response: Response): Promise<Response> {
    let currentRes = response;
    for (const interceptor of this.responseInterceptors) {
      currentRes = await interceptor(currentRes);
    }
    return currentRes;
  }
}
