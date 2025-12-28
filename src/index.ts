/**
 * Express Utils - A comprehensive utility library for Express.js applications
 * 
 * This library provides essential utilities for building robust Express applications:
 * - Error handling with custom AppError class and global error handler
 * - Async error catching middleware
 * - Response formatting with callback-based chaining
 * - Database connection management with retry logic
 * - Structured logging with Winston
 */

/**
 * Custom error class for application errors with status codes and operational flags
 */
export { AppError } from "./AppError.js";

/**
 * Higher-order function to catch asynchronous errors in Express route handlers
 */
export { catchAsync } from "./catchAsync.js";

/**
 * Global error handler middleware for Express applications
 */
export { errorHandler } from "./errorHandler.js";

/**
 * Winston logger instance for structured application logging
 */
export { logger } from "./logger.js";

/**
 * Response formatting utilities with callback-based method chaining
 */
export { sendSuccess, sendError } from "./responseFormatter.js";

/**
 * Database connection utilities for MongoDB with automatic retry logic
 */
export {
  default as connectDB,
  getDBStatus,
  resetDBConnection,
  DatabaseConnection,
} from "./DatabaseConnection.js";
