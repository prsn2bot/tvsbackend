"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const logger_1 = __importDefault(require("../utils/logger"));
// Global error handling middleware
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let response = {
        success: false,
        message: "Internal server error",
    };
    // Log the error
    logger_1.default.error("Error occurred:", {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
    });
    // Handle different types of errors
    if (error instanceof AppError_1.AppError) {
        // Custom application errors
        statusCode = error.statusCode;
        response.message = error.message;
    }
    else if (error instanceof zod_1.ZodError) {
        // Zod validation errors
        statusCode = 400;
        response.message = "Validation failed";
        response.errors = error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            code: err.code,
        }));
    }
    else if (error.name === "JsonWebTokenError") {
        // JWT errors
        statusCode = 401;
        response.message = "Invalid token";
    }
    else if (error.name === "TokenExpiredError") {
        // JWT expiration errors
        statusCode = 401;
        response.message = "Token expired";
    }
    else if (error.name === "ValidationError") {
        // Mongoose/Database validation errors
        statusCode = 400;
        response.message = "Validation failed";
        response.errors = Object.values(error).map((err) => ({
            field: err.path,
            message: err.message,
        }));
    }
    else if (error.name === "CastError") {
        // Database cast errors (invalid ObjectId, etc.)
        statusCode = 400;
        response.message = "Invalid data format";
    }
    else if (error.name === "MongoError" || error.name === "MongoServerError") {
        // MongoDB specific errors
        const mongoError = error;
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
    }
    else if (error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")) {
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
exports.errorHandler = errorHandler;
// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;
// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.middleware.js.map