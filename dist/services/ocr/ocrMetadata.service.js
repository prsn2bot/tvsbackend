"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrMetadataService = exports.OcrMetadataService = void 0;
const case_model_1 = require("../../models/case.model");
const logger_1 = __importDefault(require("../../utils/logger"));
class OcrMetadataService {
    /**
     * Updates document with OCR processing results and metadata
     */
    async updateDocumentWithOcrResult(documentId, ocrResult, retryCount = 0, errorDetails) {
        try {
            const updateData = {
                ocr_text: ocrResult.text,
                ocr_status: "completed",
                ocr_method_used: ocrResult.method,
                ocr_confidence: ocrResult.confidence,
                ocr_processing_time: ocrResult.processingTime,
                ocr_retry_count: retryCount,
                ocr_last_attempt: new Date(),
            };
            if (errorDetails) {
                updateData.ocr_error_details = errorDetails;
            }
            await case_model_1.CaseModel.updateDocument(documentId, updateData);
            logger_1.default.info(`Document ${documentId} updated with OCR metadata`, {
                method: ocrResult.method,
                confidence: ocrResult.confidence,
                processingTime: ocrResult.processingTime,
                textLength: ocrResult.text.length,
                retryCount,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to update document ${documentId} with OCR metadata:`, error);
            throw error;
        }
    }
    /**
     * Updates document with OCR failure information
     */
    async updateDocumentWithOcrFailure(documentId, method, errorDetails, retryCount = 0, processingTime) {
        try {
            const updateData = {
                ocr_status: "failed",
                ocr_method_used: method,
                ocr_retry_count: retryCount,
                ocr_error_details: errorDetails,
                ocr_last_attempt: new Date(),
            };
            if (processingTime) {
                updateData.ocr_processing_time = processingTime;
            }
            await case_model_1.CaseModel.updateDocument(documentId, updateData);
            logger_1.default.warn(`Document ${documentId} marked as OCR failed`, {
                method,
                errorDetails,
                retryCount,
                processingTime,
            });
        }
        catch (error) {
            logger_1.default.error(`Failed to update document ${documentId} with OCR failure:`, error);
            throw error;
        }
    }
    /**
     * Marks document as OCR pending
     */
    async markDocumentOcrPending(documentId, method) {
        try {
            await case_model_1.CaseModel.updateDocument(documentId, {
                ocr_status: "pending",
                ocr_method_used: method,
                ocr_last_attempt: new Date(),
            });
            logger_1.default.info(`Document ${documentId} marked as OCR pending with method: ${method}`);
        }
        catch (error) {
            logger_1.default.error(`Failed to mark document ${documentId} as OCR pending:`, error);
            throw error;
        }
    }
    /**
     * Increments retry count for a document
     */
    async incrementRetryCount(documentId) {
        try {
            // Get current document to read retry count
            const document = await case_model_1.CaseModel.findDocumentById(documentId);
            if (!document) {
                throw new Error(`Document ${documentId} not found`);
            }
            const newRetryCount = (document.ocr_retry_count || 0) + 1;
            await case_model_1.CaseModel.updateDocument(documentId, {
                ocr_retry_count: newRetryCount,
                ocr_last_attempt: new Date(),
            });
            logger_1.default.debug(`Incremented retry count for document ${documentId} to ${newRetryCount}`);
            return newRetryCount;
        }
        catch (error) {
            logger_1.default.error(`Failed to increment retry count for document ${documentId}:`, error);
            throw error;
        }
    }
    /**
     * Gets OCR processing statistics for analytics
     */
    async getOcrProcessingStats() {
        try {
            // This would typically use a database query to get aggregated stats
            // For now, we'll return a placeholder structure
            logger_1.default.info("Retrieving OCR processing statistics");
            // In a real implementation, you would execute SQL queries like:
            // SELECT ocr_method_used, COUNT(*), AVG(ocr_confidence), AVG(ocr_processing_time)
            // FROM documents WHERE ocr_method_used IS NOT NULL GROUP BY ocr_method_used
            return {
                totalDocuments: 0,
                completedDocuments: 0,
                failedDocuments: 0,
                pendingDocuments: 0,
                methodStats: [],
                overallStats: {
                    avgConfidence: 0,
                    avgProcessingTime: 0,
                    totalRetries: 0,
                    successRate: 0,
                },
            };
        }
        catch (error) {
            logger_1.default.error("Failed to retrieve OCR processing statistics:", error);
            throw error;
        }
    }
    /**
     * Gets documents that need OCR retry based on failure conditions
     */
    async getDocumentsForRetry(maxRetries = 3) {
        try {
            // This would typically use a database query to find documents that:
            // 1. Have OCR status 'failed'
            // 2. Have retry count less than maxRetries
            // 3. Last attempt was more than X minutes ago (to avoid immediate retries)
            logger_1.default.info(`Finding documents for OCR retry (max retries: ${maxRetries})`);
            // Placeholder return - in real implementation, execute appropriate SQL query
            return [];
        }
        catch (error) {
            logger_1.default.error("Failed to get documents for OCR retry:", error);
            throw error;
        }
    }
    /**
     * Cleans up old OCR error details and metadata for documents older than specified days
     */
    async cleanupOldOcrMetadata(olderThanDays = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            logger_1.default.info(`Cleaning up OCR metadata older than ${olderThanDays} days (before ${cutoffDate.toISOString()})`);
            // This would typically execute an UPDATE query to clear old error details
            // UPDATE documents SET ocr_error_details = NULL
            // WHERE ocr_last_attempt < $1 AND ocr_error_details IS NOT NULL
            // Placeholder return - in real implementation, return number of affected rows
            return 0;
        }
        catch (error) {
            logger_1.default.error("Failed to cleanup old OCR metadata:", error);
            throw error;
        }
    }
    /**
     * Validates OCR metadata before updating document
     */
    validateOcrMetadata(metadata) {
        if (metadata.ocr_confidence !== undefined) {
            if (metadata.ocr_confidence < 0 || metadata.ocr_confidence > 1) {
                throw new Error("OCR confidence must be between 0 and 1");
            }
        }
        if (metadata.ocr_processing_time !== undefined) {
            if (metadata.ocr_processing_time < 0) {
                throw new Error("OCR processing time must be non-negative");
            }
        }
        if (metadata.ocr_retry_count !== undefined) {
            if (metadata.ocr_retry_count < 0) {
                throw new Error("OCR retry count must be non-negative");
            }
        }
    }
}
exports.OcrMetadataService = OcrMetadataService;
// Export singleton instance
exports.ocrMetadataService = new OcrMetadataService();
//# sourceMappingURL=ocrMetadata.service.js.map