export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational: true;
  public readonly errors?: string[];

  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode.toString().startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors.length > 0 ? errors : undefined;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
