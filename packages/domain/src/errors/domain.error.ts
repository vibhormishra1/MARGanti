export class DomainError extends Error {
  public readonly code: string;

  constructor(message: string, code = "DOMAIN_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    
    // Capture stack trace in environments that support it (V8)
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}
