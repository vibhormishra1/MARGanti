type LogLevel = "info" | "warn" | "error";

interface TelemetryEvent {
  level: LogLevel;
  event: string;
  context?: Record<string, any>;
  timestamp: string;
}

class TelemetryClient {
  private log(level: LogLevel, event: string, context?: Record<string, any>) {
    const logEntry: TelemetryEvent = {
      level,
      event,
      context,
      timestamp: new Date().toISOString(),
    };

    // In a real production system, this would queue locally and batch sync 
    // to a telemetry endpoint to respect offline-first tier 0 operation.
    // For now, we emit structured JSON to the console.
    if (level === "error") {
      console.error(JSON.stringify(logEntry));
    } else if (level === "warn") {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.info(JSON.stringify(logEntry));
    }
  }

  info(event: string, context?: Record<string, any>) {
    this.log("info", event, context);
  }

  warn(event: string, context?: Record<string, any>) {
    this.log("warn", event, context);
  }

  error(event: string, error: Error | unknown, context?: Record<string, any>) {
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack } 
      : { message: String(error) };
      
    this.log("error", event, { ...context, error: errorDetails });
  }

  trackApiCall(method: string, url: string, durationMs: number, status: number, isError: boolean) {
    this.log(isError ? "error" : "info", "api_request", {
      method,
      url,
      durationMs,
      status,
      success: !isError
    });
  }
}

export const telemetry = new TelemetryClient();
