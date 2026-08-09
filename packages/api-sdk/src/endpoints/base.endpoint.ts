import { HttpClient } from "../client/http.client";

export abstract class BaseEndpoint {
  constructor(protected readonly client: HttpClient) {}
}
