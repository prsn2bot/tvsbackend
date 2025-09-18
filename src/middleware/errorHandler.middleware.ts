import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

// Standard error response interface
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  stack?: string;
}

// Global error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let response: ErrorResponse = {
    success: false,
    message: "Internal server error",
  };

  // Log the error
  logger.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Handle different types of errors
  if (error instanceof AppError) {
    // Custom application errors
    statusCode = error.statusCode;
    response.message = error.message;
  } else if (error instanceof ZodError) {
    // Zod validation errors
    statusCode = 400;
    response.message = "Validation failed";
    response.errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      code: err.code,
    }));
  } else if (error.name === "JsonWebTokenError") {
    // JWT errors
    statusCode = 401;
    response.message = "Invalid token";
  } else if (error.name === "TokenExpiredError") {
    // JWT expiration errors
    statusCode = 401;
    response.message = "Token expired";
  } else if (error.name === "ValidationError") {
    // Mongoose/Database validation errors
    statusCode = 400;
    response.message = "Validation failed";
    response.errors = Object.values(error as any).map((err: any) => ({
      field: err.path,
      message: err.message,
    }));
  } else if (error.name === "CastError") {
    // Database cast errors (invalid ObjectId, etc.)
    statusCode = 400;
    response.message = "Invalid data format";
  } else if (error.name === "MongoError" || error.name === "MongoServerError") {
    // MongoDB specific errors
    const mongoError = error as any;
    if (mongoError.code === 11000) {
      // Duplicate key error
      statusCode = 409;
      response.message = "Duplicate entry found";
      const field = Object.keys(mongoError.keyPattern)[0];
      response.errors = [
        {
          field,
          message: `${field} already exists`,
          code: "duplicate",
        },
      ];
    }
  } else if (
    error.message.includes("ENOTFOUND") ||
    error.message.includes("ECONNREFUSED")
  ) {
    // Network/connection errors
    statusCode = 503;
    response.message = "Service temporarily unavailable";
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
