import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError.js";

interface ErrorResponse {
  status: string;
  message: string;
  errors?: string[];
  stack?: string;
  error?: any;
}

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    error: err,
    errors: err.errors || [],
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  // Operational, trusted error → send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && err.errors.length > 0 && { errors: err.errors }),
    });
  } else {
    // Unknown error → hide details
    console.error("ERROR", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  // Add this for Extra In-Depth Error Logging
  console.error("Error details:", {
    message: err.message,
    statusCode: err.statusCode,
    errors: err.errors,
    stack: err.stack,
    fullError: err,
  });
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(
      err instanceof AppError ? err : new AppError(err.message, 500),
      res,
    );
  }
};

export { errorHandler };
