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
 * - **Auto-sends** when no chaining detected (no send() needed)
 * - Returns Express response object for native method chaining
 * - Use send() only when chaining methods (.cookie(), .header(), etc.)
 * - Clean and predictable approach
 *
 * @param {Response} res - Express response object.
 * @param {any} data - Response data.
 * @param {string} [message='Success'] - Response message.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {Response} The Express response object for chaining.
 *
 * @example
 * // Basic usage (auto-sends - no send() needed)
 * sendSuccess(res, { userId: 123 }, "Login successful");
 *
 * @example
 * // Chain methods and send manually
 * sendSuccess(res, { userId: 123 }, "Login successful", 200)
 *   .cookie("authToken", "xyz789", { httpOnly: true })
 *   .header("X-Custom", "value");
 * send(res); // Send prepared response
 *
 * @example
 * // Example Login Response
 * sendSuccess(res, { accesstoken, refreshToken, user }, "Login Successful", 200)
 *   .cookie("accessToken", accesstoken, HTTP_OPTIONS)
 *   .cookie("refreshToken", refreshToken, HTTP_OPTIONS);
 * send(res); // Send when ready
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

  // Set status and store response for later sending
  res.status(statusCode);
  (res as any)._responseData = response;

  // Auto-send unless chaining is detected (using setImmediate to check)
  setImmediate(() => {
    if (!(res as any)._responseSent && (res as any)._responseData) {
      (res as any)._responseSent = true;
      res.json((res as any)._responseData);
    }
  });

  return res;
};

/**
 * Sends the prepared success response.
 * Use this only when chaining methods (.cookie(), .header(), etc.).
 * For basic usage, sendSuccess() auto-sends and you don't need this.
 *
 * @param {Response} res - Express response object.
 * @returns {void}
 *
 * @example
 * // Only needed when chaining methods
 * sendSuccess(res, data, "Success", 200)
 *   .cookie("session", "abc123")
 *   .header("X-Custom", "value");
 * send(res); // Send when ready
 */
export const send = (res: Response): void => {
  res.json((res as any)._responseData);
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

