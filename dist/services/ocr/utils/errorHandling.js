"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorHandling = exports.OcrErrorRecovery = exports.OcrErrorFactory = exports.OCR_ERROR_CODES = exports.EnhancedOcrError = void 0;
const ocr_types_1 = require("../types/ocr.types");
const logger_1 = __importDefault(require("../../../utils/logger"));
/**
 * Enhanced OCR error class with additional context
 */
class EnhancedOcrError extends ocr_types_1.OcrError {
    constructor(message, method, errorCode, context, originalError, retryable = true) {
        super(message, method, originalError, retryable);
        this.errorCode = errorCode;
        this.context = context;
        this.name = "EnhancedOcrError";
    }
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            method: this.method,
            errorCode: this.errorCode,
            context: this.context,
            retryable: this.retryable,
            stack: this.stack,
        };
    }
}
exports.EnhancedOcrError = EnhancedOcrError;
/**
 * Common OCR error codes
 */
exports.OCR_ERROR_CODES = {
    // Configuration errors
    INVALID_CONFIG: "INVALID_CONFIG",
    METHOD_DISABLED: "METHOD_DISABLED",
    // File errors
    FILE_NOT_FOUND: "FILE_NOT_FOUND",
    FILE_TOO_LARGE: "FILE_TOO_LARGE",
    UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
    CORRUPTED_FILE: "CORRUPTED_FILE",
    // Processing errors
    TIMEOUT: "TIMEOUT",
    MEMORY_ERROR: "MEMORY_ERROR",
    PROCESSING_FAILED: "PROCESSING_FAILED",
    NO_TEXT_FOUND: "NO_TEXT_FOUND",
    // Network errors
    NETWORK_ERROR: "NETWORK_ERROR",
    SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
    // Quality errors
    LOW_QUALITY: "LOW_QUALITY",
    GIBBERISH_DETECTED: "GIBBERISH_DETECTED",
};
/**
 * Creates standardized OCR errors
 */
class OcrErrorFactory {
    static createFileError(method, code, filePath, originalError) {
        const messages = {
            [exports.OCR_ERROR_CODES.FILE_NOT_FOUND]: `File not found: ${filePath}`,
            [exports.OCR_ERROR_CODES.FILE_TOO_LARGE]: `File too large for processing: ${filePath}`,
            [exports.OCR_ERROR_CODES.UNSUPPORTED_FORMAT]: `Unsupported file format: ${filePath}`,
            [exports.OCR_ERROR_CODES.CORRUPTED_FILE]: `File appears to be corrupted: ${filePath}`,
        };
        return new EnhancedOcrError(messages[code] || `File error: ${filePath}`, method, code, { filePath }, originalError, false // File errors are typically not retryable
        );
    }
    static createProcessingError(method, code, context, originalError) {
        const messages = {
            [exports.OCR_ERROR_CODES.TIMEOUT]: "OCR processing timed out",
            [exports.OCR_ERROR_CODES.MEMORY_ERROR]: "Insufficient memory for OCR processing",
            [exports.OCR_ERROR_CODES.PROCESSING_FAILED]: "OCR processing failed",
            [exports.OCR_ERROR_CODES.NO_TEXT_FOUND]: "No text could be extracted from document",
        };
        const retryable = code !== exports.OCR_ERROR_CODES.NO_TEXT_FOUND;
        return new EnhancedOcrError(messages[code] || "Processing error occurred", method, code, context, originalError, retryable);
    }
    static createNetworkError(method, code, url, originalError) {
        const messages = {
            [exports.OCR_ERROR_CODES.NETWORK_ERROR]: `Network error occurred${url ? ` for ${url}` : ""}`,
            [exports.OCR_ERROR_CODES.SERVICE_UNAVAILABLE]: `OCR service unavailable${url ? ` at ${url}` : ""}`,
        };
        return new EnhancedOcrError(messages[code] || "Network error occurred", method, code, { url }, originalError, true // Network errors are typically retryable
        );
    }
    static createQualityError(method, code, qualityMetrics, originalError) {
        const messages = {
            [exports.OCR_ERROR_CODES.LOW_QUALITY]: "Extracted text quality is below threshold",
            [exports.OCR_ERROR_CODES.GIBBERISH_DETECTED]: "Extracted text appears to be gibberish",
        };
        return new EnhancedOcrError(messages[code] || "Quality error occurred", method, code, qualityMetrics, originalError, false // Quality errors are typically not retryable with same method
        );
    }
}
exports.OcrErrorFactory = OcrErrorFactory;
/**
 * Error recovery strategies for different error types
 */
class OcrErrorRecovery {
    /**
     * Determines if an error should trigger a fallback to another OCR method
     */
    static shouldFallback(error) {
        const fallbackCodes = [
            exports.OCR_ERROR_CODES.PROCESSING_FAILED,
            exports.OCR_ERROR_CODES.TIMEOUT,
            exports.OCR_ERROR_CODES.LOW_QUALITY,
            exports.OCR_ERROR_CODES.SERVICE_UNAVAILABLE,
        ];
        return fallbackCodes.includes(error.errorCode);
    }
    /**
     * Determines if an error should trigger a retry with the same method
     */
    static shouldRetry(error, attemptCount, maxAttempts) {
        if (attemptCount >= maxAttempts)
            return false;
        if (!error.retryable)
            return false;
        const retryCodes = [
            exports.OCR_ERROR_CODES.TIMEOUT,
            exports.OCR_ERROR_CODES.MEMORY_ERROR,
            exports.OCR_ERROR_CODES.NETWORK_ERROR,
        ];
        return retryCodes.includes(error.errorCode);
    }
    /**
     * Calculates retry delay based on error type and attempt count
     */
    static getRetryDelay(error, attemptCount) {
        const baseDelay = 1000; // 1 second
        switch (error.errorCode) {
            case exports.OCR_ERROR_CODES.NETWORK_ERROR:
                // Exponential backoff for network errors
                return Math.min(baseDelay * Math.pow(2, attemptCount), 30000);
            case exports.OCR_ERROR_CODES.MEMORY_ERROR:
                // Longer delay for memory errors to allow cleanup
                return Math.min(baseDelay * 3 * attemptCount, 15000);
            case exports.OCR_ERROR_CODES.TIMEOUT:
                // Linear increase for timeout errors
                return Math.min(baseDelay * (1 + attemptCount), 10000);
            default:
                return baseDelay * attemptCount;
        }
    }
    /**
     * Logs error with appropriate level and context
     */
    static logError(error, context) {
        const logContext = {
            method: error.method,
            errorCode: error.errorCode,
            retryable: error.retryable,
            ...error.context,
            ...context,
        };
        if (error.retryable) {
            logger_1.default.warn(`OCR error (retryable): ${error.message}`, logContext);
        }
        else {
            logger_1.default.error(`OCR error (non-retryable): ${error.message}`, logContext);
        }
        if (error.originalError) {
            logger_1.default.debug("Original error details:", {
                originalMessage: error.originalError.message,
                originalStack: error.originalError.stack,
            });
        }
    }
    /**
     * Creates a comprehensive error report for debugging
     */
    static createErrorReport(errors, context) {
        return {
            timestamp: new Date().toISOString(),
            context,
            totalErrors: errors.length,
            errorSummary: errors.map((error) => ({
                method: error.method,
                code: error.errorCode,
                message: error.message,
                retryable: error.retryable,
            })),
            retryableErrors: errors.filter((e) => e.retryable).length,
            nonRetryableErrors: errors.filter((e) => !e.retryable).length,
            mostCommonError: this.getMostCommonError(errors),
        };
    }
    static getMostCommonError(errors) {
        if (errors.length === 0)
            return null;
        const errorCounts = errors.reduce((acc, error) => {
            acc[error.errorCode] = (acc[error.errorCode] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(errorCounts).sort(([, a], [, b]) => b - a)[0][0];
    }
}
exports.OcrErrorRecovery = OcrErrorRecovery;
/**
 * Utility function to wrap async OCR operations with error handling
 */
async function withErrorHandling(operation, method, context) {
    try {
        return await operation();
    }
    catch (error) {
        if (error instanceof EnhancedOcrError) {
            OcrErrorRecovery.logError(error, context);
            throw error;
        }
        // Convert unknown errors to EnhancedOcrError
        const enhancedError = new EnhancedOcrError(error instanceof Error ? error.message : "Unknown error occurred", method, exports.OCR_ERROR_CODES.PROCESSING_FAILED, context, error instanceof Error ? error : undefined);
        OcrErrorRecovery.logError(enhancedError, context);
        throw enhancedError;
    }
}
exports.withErrorHandling = withErrorHandling;
//# sourceMappingURL=errorHandling.js.map