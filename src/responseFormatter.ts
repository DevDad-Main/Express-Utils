import { Response } from "express";

interface SuccessResponse {
  status: "success";
  success: true;
  message: string;
  data?: any;
}

interface ErrorResponse {
  status: "error";
  success: false;
  message: string;
  data?: any;
}

/**
 * Sends a success response and returns the response object for chaining.
 * Automatically sends the response after chaining operations complete - no extra .send() needed!
 * 
 * Features:
 * - Includes success: true field by default
 * - Supports method chaining (.cookie(), .header(), etc.)
 * - Automatically sends response after chaining completes
 * - Returns Express response object for chaining
 * 
 * @param {Response} res - Express response object.
 * @param {any} data - Response data.
 * @param {string} [message='Success'] - Response message.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {Response} The Express response object for chaining.
 * 
 * @example
 * // Basic usage
 * sendSuccess(res, { userId: 123 }, "Login successful");
 * 
 * @example
 * // Chain methods without calling .send()
 * sendSuccess(res, { userId: 123 }, "Login successful", 200)
 *   .cookie("authToken", "xyz789", { httpOnly: true })
 *   .header("X-Custom", "value");
 * // Response sent automatically!
 */
export const sendSuccess = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200,
): Response => {
  const response: SuccessResponse = {
    status: "success",
    success: true,
    message,
    data,
  };
  
  res.status(statusCode);
  
  // Use setImmediate to send response after current execution stack
  setImmediate(() => {
    if (!(res as any)._responseSent) {
      (res as any)._responseSent = true;
      res.json(response);
    }
  });
  
  return res;
};

/**
 * Sends an error response immediately.
 * 
 * Features:
 * - Includes success: false field by default
 * - Sends response immediately (no chaining needed)
 * - Supports optional error data
 * 
 * @param {Response} res - Express response object.
 * @param {string} message - Error message.
 * @param {number} [statusCode=400] - HTTP status code.
 * @param {any} [data] - Additional error data.
 * 
 * @example
 * // Basic error
 * sendError(res, "User not found", 404);
 * 
 * @example
 * // Error with additional data
 * sendError(res, "Validation failed", 400, { 
 *   errors: ["Email is required", "Password too short"] 
 * });
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  data?: any,
): void => {
  const response: ErrorResponse = {
    status: "error",
    success: false,
    message,
    ...(data && { data }),
  };
  res.status(statusCode).json(response);
};
