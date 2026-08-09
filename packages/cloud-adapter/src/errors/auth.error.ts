import { CloudAdapterError } from "./cloud-adapter.error";

/**
 * Authentication and authorization errors.
 */
export class AuthError extends CloudAdapterError {
  constructor(
    message: string,
    options: {
      code?: string;
      retryable?: boolean;
      cause?: Error;
      metadata?: Record<string, unknown>;
    } = {}
  ) {
    super(message, {
      code: options.code ?? "CLOUD_AUTH_ERROR",
      retryable: options.retryable ?? false,
      cause: options.cause,
      metadata: options.metadata,
    });
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid credentials provided", cause?: Error) {
    super(message, {
      code: "CLOUD_AUTH_INVALID_CREDENTIALS",
      retryable: false,
      cause,
    });
    this.name = "InvalidCredentialsError";
  }
}

export class SessionExpiredError extends AuthError {
  constructor(message = "Authentication session has expired", cause?: Error) {
    super(message, {
      code: "CLOUD_AUTH_SESSION_EXPIRED",
      retryable: true,
      cause,
    });
    this.name = "SessionExpiredError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(
    message = "Insufficient permissions for this operation",
    options: { resource?: string; action?: string; cause?: Error } = {}
  ) {
    super(message, {
      code: "CLOUD_AUTH_UNAUTHORIZED",
      retryable: false,
      cause: options.cause,
      metadata: {
        ...(options.resource && { resource: options.resource }),
        ...(options.action && { action: options.action }),
      },
    });
    this.name = "UnauthorizedError";
  }
}
