/**
 * Custom error class for application errors.
 * Extends the built-in Error class with additional properties for status code, status, and operational flag.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational: true;
  public readonly errors?: string[];

  /**
   * Creates an instance of AppError.
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code.
   * @param {string[]} [errors=[]] - Optional array of additional error messages.
   */
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
