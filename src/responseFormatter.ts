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
 * Sends a success response with intelligent auto-sending behavior.
 *
 * Features:
 * - Includes success: true field by default
 * - **Auto-sends** when no callbacks provided
 * - Supports method chaining through callback functions
 * - Clean and predictable approach
 *
 * @param {Response} res - Express response object.
 * @param {any} data - Response data.
 * @param {string} [message='Success'] - Response message.
 * @param {number} [statusCode=200] - HTTP status code.
 * @param {((res: Response) => Response)[]} [callbacks] - Optional array of callback functions for chaining response methods.
 * @returns {Response} The Express response object.
 *
 * @example
 * // Basic usage (auto-sends - no callbacks needed)
 * sendSuccess(res, { userId: 123 }, "Login successful");
 *
 * @example
 * // Chain methods using callbacks
 * sendSuccess(res, { userId: 123 }, "Login successful", 200, [
 *   (res) => res.cookie("authToken", "xyz789", { httpOnly: true }),
 *   (res) => res.header("X-Custom", "value")
 * ]);
 *
 * @example
 * // Example Login Response with multiple callbacks
 * sendSuccess(res, { accesstoken, refreshToken, user }, "Login Successful", 200, [
 *   (res) => res.cookie("accessToken", accesstoken, HTTP_OPTIONS),
 *   (res) => res.cookie("refreshToken", refreshToken, HTTP_OPTIONS)
 * ]);
 */
export const sendSuccess = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200,
  callbacks?: ((res: Response) => Response)[],
): Response => {
  const response: SuccessResponse = {
    status: "success",
    success: true,
    message,
    data,
  };
  
  res.status(statusCode);
  
  // Execute callbacks for chaining if provided
  if (callbacks && callbacks.length > 0) {
    let currentRes = res;
    for (const callback of callbacks) {
      if (typeof callback === 'function') {
        currentRes = callback(currentRes);
      }
    }
  }
  
  // Send response
  return res.json(response);
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

