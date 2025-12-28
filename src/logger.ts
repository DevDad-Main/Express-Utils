import winston from "winston";

/**
 * Winston logger instance for application logging.
 * 
 * Features:
 * - Different log levels for production vs development
 * - Console and file logging (in development)
 * - JSON format for structured logging
 * - Error stack trace capture
 * - Custom service name via SERVICE_NAME environment variable
 * 
 * @example
 * // Basic logging
 * logger.info("User logged in", { userId: 123 });
 * logger.error("Database connection failed", { error: err });
 * logger.debug("Processing request", { method: "POST", url: "/api/users" });
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || "express-utils" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    ...(process.env.NODE_ENV !== "production" ? [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ] : []),
  ],
});