import { Response } from "express";

interface SuccessResponse {
  status: "success";
  message: string;
  data?: any;
}

interface ErrorResponse {
  status: "error";
  message: string;
  data?: any;
}

/**
 * Sends a success response.
 * @param {Response} res - Express response object.
 * @param {any} data - Response data.
 * @param {string} [message='Success'] - Response message.
 * @param {number} [statusCode=200] - HTTP status code.
 * @returns {Response} The Express response object for chaining.
 */
export const sendSuccess = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200,
): Response => {
  const response: SuccessResponse = {
    status: "success",
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Sends an error response.
 * @param {Response} res - Express response object.
 * @param {string} message - Error message.
 * @param {number} [statusCode=400] - HTTP status code.
 * @param {any} [data] - Additional error data.
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  data?: any,
): void => {
  const response: ErrorResponse = {
    status: "error",
    message,
    ...(data && { data }),
  };
  res.status(statusCode).json(response);
};
