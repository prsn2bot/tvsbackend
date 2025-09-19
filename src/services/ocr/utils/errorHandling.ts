import { OcrError, OcrMethod, OcrRetryStrategy } from "../types/ocr.types";
import logger from "../../../utils/logger";

/**
 * Enhanced OCR error class with additional context
 */
export class EnhancedOcrError extends OcrError {
  constructor(
    message: string,
    method: OcrMethod,
    public errorCode: string,
    public context?: Record<string, any>,
    originalError?: Error,
    retryable: boolean = true
  ) {
    super(message, method, originalError, retryable);
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

/**
 * Common OCR error codes
 */
export const OCR_ERROR_CODES = {
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
} as const;

export type OcrErrorCode =
  (typeof OCR_ERROR_CODES)[keyof typeof OCR_ERROR_CODES];

/**
 * Creates standardized OCR errors
 */
export class OcrErrorFactory {
  static createFileError(
    method: OcrMethod,
    code: OcrErrorCode,
    filePath: string,
    originalError?: Error
  ): EnhancedOcrError {
    const messages: Record<string, string> = {
      [OCR_ERROR_CODES.FILE_NOT_FOUND]: `File not found: ${filePath}`,
      [OCR_ERROR_CODES.FILE_TOO_LARGE]: `File too large for processing: ${filePath}`,
      [OCR_ERROR_CODES.UNSUPPORTED_FORMAT]: `Unsupported file format: ${filePath}`,
      [OCR_ERROR_CODES.CORRUPTED_FILE]: `File appears to be corrupted: ${filePath}`,
    };

    return new EnhancedOcrError(
      messages[code] || `File error: ${filePath}`,
      method,
      code,
      { filePath },
      originalError,
      false // File errors are typically not retryable
    );
  }

  static createProcessingError(
    method: OcrMethod,
    code: OcrErrorCode,
    context?: Record<string, any>,
    originalError?: Error
  ): EnhancedOcrError {
    const messages: Record<string, string> = {
      [OCR_ERROR_CODES.TIMEOUT]: "OCR processing timed out",
      [OCR_ERROR_CODES.MEMORY_ERROR]: "Insufficient memory for OCR processing",
      [OCR_ERROR_CODES.PROCESSING_FAILED]: "OCR processing failed",
      [OCR_ERROR_CODES.NO_TEXT_FOUND]:
        "No text could be extracted from document",
    };

    const retryable = code !== OCR_ERROR_CODES.NO_TEXT_FOUND;

    return new EnhancedOcrError(
      messages[code] || "Processing error occurred",
      method,
      code,
      context,
      originalError,
      retryable
    );
  }

  static createNetworkError(
    method: OcrMethod,
    code: OcrErrorCode,
    url?: string,
    originalError?: Error
  ): EnhancedOcrError {
    const messages: Record<string, string> = {
      [OCR_ERROR_CODES.NETWORK_ERROR]: `Network error occurred${
        url ? ` for ${url}` : ""
      }`,
      [OCR_ERROR_CODES.SERVICE_UNAVAILABLE]: `OCR service unavailable${
        url ? ` at ${url}` : ""
      }`,
    };

    return new EnhancedOcrError(
      messages[code] || "Network error occurred",
      method,
      code,
      { url },
      originalError,
      true // Network errors are typically retryable
    );
  }

  static createQualityError(
    method: OcrMethod,
    code: OcrErrorCode,
    qualityMetrics?: Record<string, any>,
    originalError?: Error
  ): EnhancedOcrError {
    const messages: Record<string, string> = {
      [OCR_ERROR_CODES.LOW_QUALITY]:
        "Extracted text quality is below threshold",
      [OCR_ERROR_CODES.GIBBERISH_DETECTED]:
        "Extracted text appears to be gibberish",
    };

    return new EnhancedOcrError(
      messages[code] || "Quality error occurred",
      method,
      code,
      qualityMetrics,
      originalError,
      false // Quality errors are typically not retryable with same method
    );
  }
}

/**
 * Error recovery strategies for different error types
 */
export class OcrErrorRecovery {
  /**
   * Determines if an error should trigger a fallback to another OCR method
   */
  static shouldFallback(error: EnhancedOcrError): boolean {
    const fallbackCodes: string[] = [
      OCR_ERROR_CODES.PROCESSING_FAILED,
      OCR_ERROR_CODES.TIMEOUT,
      OCR_ERROR_CODES.LOW_QUALITY,
      OCR_ERROR_CODES.SERVICE_UNAVAILABLE,
    ];

    return fallbackCodes.includes(error.errorCode);
  }

  /**
   * Determines if an error should trigger a retry with the same method
   */
  static shouldRetry(
    error: EnhancedOcrError,
    attemptCount: number,
    maxAttempts: number
  ): boolean {
    if (attemptCount >= maxAttempts) return false;
    if (!error.retryable) return false;

    const retryCodes: string[] = [
      OCR_ERROR_CODES.TIMEOUT,
      OCR_ERROR_CODES.MEMORY_ERROR,
      OCR_ERROR_CODES.NETWORK_ERROR,
    ];

    return retryCodes.includes(error.errorCode);
  }

  /**
   * Calculates retry delay based on error type and attempt count
   */
  static getRetryDelay(error: EnhancedOcrError, attemptCount: number): number {
    const baseDelay = 1000; // 1 second

    switch (error.errorCode) {
      case OCR_ERROR_CODES.NETWORK_ERROR:
        // Exponential backoff for network errors
        return Math.min(baseDelay * Math.pow(2, attemptCount), 30000);

      case OCR_ERROR_CODES.MEMORY_ERROR:
        // Longer delay for memory errors to allow cleanup
        return Math.min(baseDelay * 3 * attemptCount, 15000);

      case OCR_ERROR_CODES.TIMEOUT:
        // Linear increase for timeout errors
        return Math.min(baseDelay * (1 + attemptCount), 10000);

      default:
        return baseDelay * attemptCount;
    }
  }

  /**
   * Logs error with appropriate level and context
   */
  static logError(
    error: EnhancedOcrError,
    context?: Record<string, any>
  ): void {
    const logContext = {
      method: error.method,
      errorCode: error.errorCode,
      retryable: error.retryable,
      ...error.context,
      ...context,
    };

    if (error.retryable) {
      logger.warn(`OCR error (retryable): ${error.message}`, logContext);
    } else {
      logger.error(`OCR error (non-retryable): ${error.message}`, logContext);
    }

    if (error.originalError) {
      logger.debug("Original error details:", {
        originalMessage: error.originalError.message,
        originalStack: error.originalError.stack,
      });
    }
  }

  /**
   * Creates a comprehensive error report for debugging
   */
  static createErrorReport(
    errors: EnhancedOcrError[],
    context: Record<string, any>
  ): Record<string, any> {
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

  private static getMostCommonError(errors: EnhancedOcrError[]): string | null {
    if (errors.length === 0) return null;

    const errorCounts = errors.reduce((acc, error) => {
      acc[error.errorCode] = (acc[error.errorCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts).sort(([, a], [, b]) => b - a)[0][0];
  }
}

/**
 * Utility function to wrap async OCR operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  method: OcrMethod,
  context?: Record<string, any>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof EnhancedOcrError) {
      OcrErrorRecovery.logError(error, context);
      throw error;
    }

    // Convert unknown errors to EnhancedOcrError
    const enhancedError = new EnhancedOcrError(
      error instanceof Error ? error.message : "Unknown error occurred",
      method,
      OCR_ERROR_CODES.PROCESSING_FAILED,
      context,
      error instanceof Error ? error : undefined
    );

    OcrErrorRecovery.logError(enhancedError, context);
    throw enhancedError;
  }
}
