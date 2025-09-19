import { CaseModel } from "../../models/case.model";
import { OcrResult, DocumentOcrMetadata } from "./types/ocr.types";
import logger from "../../utils/logger";

export class OcrMetadataService {
  /**
   * Updates document with OCR processing results and metadata
   */
  async updateDocumentWithOcrResult(
    documentId: number,
    ocrResult: OcrResult,
    retryCount: number = 0,
    errorDetails?: string
  ): Promise<void> {
    try {
      const updateData: Partial<
        DocumentOcrMetadata & { ocr_text: string; ocr_status: string }
      > = {
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

      await CaseModel.updateDocument(documentId, updateData);

      logger.info(`Document ${documentId} updated with OCR metadata`, {
        method: ocrResult.method,
        confidence: ocrResult.confidence,
        processingTime: ocrResult.processingTime,
        textLength: ocrResult.text.length,
        retryCount,
      });
    } catch (error) {
      logger.error(
        `Failed to update document ${documentId} with OCR metadata:`,
        error
      );
      throw error;
    }
  }

  /**
   * Updates document with OCR failure information
   */
  async updateDocumentWithOcrFailure(
    documentId: number,
    method: string,
    errorDetails: string,
    retryCount: number = 0,
    processingTime?: number
  ): Promise<void> {
    try {
      const updateData: Partial<DocumentOcrMetadata & { ocr_status: string }> =
        {
          ocr_status: "failed",
          ocr_method_used: method,
          ocr_retry_count: retryCount,
          ocr_error_details: errorDetails,
          ocr_last_attempt: new Date(),
        };

      if (processingTime) {
        updateData.ocr_processing_time = processingTime;
      }

      await CaseModel.updateDocument(documentId, updateData);

      logger.warn(`Document ${documentId} marked as OCR failed`, {
        method,
        errorDetails,
        retryCount,
        processingTime,
      });
    } catch (error) {
      logger.error(
        `Failed to update document ${documentId} with OCR failure:`,
        error
      );
      throw error;
    }
  }

  /**
   * Marks document as OCR pending
   */
  async markDocumentOcrPending(
    documentId: number,
    method: string
  ): Promise<void> {
    try {
      await CaseModel.updateDocument(documentId, {
        ocr_status: "pending",
        ocr_method_used: method,
        ocr_last_attempt: new Date(),
      });

      logger.info(
        `Document ${documentId} marked as OCR pending with method: ${method}`
      );
    } catch (error) {
      logger.error(
        `Failed to mark document ${documentId} as OCR pending:`,
        error
      );
      throw error;
    }
  }

  /**
   * Increments retry count for a document
   */
  async incrementRetryCount(documentId: number): Promise<number> {
    try {
      // Get current document to read retry count
      const document = await CaseModel.findDocumentById(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      const newRetryCount = (document.ocr_retry_count || 0) + 1;

      await CaseModel.updateDocument(documentId, {
        ocr_retry_count: newRetryCount,
        ocr_last_attempt: new Date(),
      });

      logger.debug(
        `Incremented retry count for document ${documentId} to ${newRetryCount}`
      );
      return newRetryCount;
    } catch (error) {
      logger.error(
        `Failed to increment retry count for document ${documentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets OCR processing statistics for analytics
   */
  async getOcrProcessingStats(): Promise<{
    totalDocuments: number;
    completedDocuments: number;
    failedDocuments: number;
    pendingDocuments: number;
    methodStats: Array<{
      method: string;
      count: number;
      avgConfidence: number;
      avgProcessingTime: number;
      successRate: number;
    }>;
    overallStats: {
      avgConfidence: number;
      avgProcessingTime: number;
      totalRetries: number;
      successRate: number;
    };
  }> {
    try {
      // This would typically use a database query to get aggregated stats
      // For now, we'll return a placeholder structure

      logger.info("Retrieving OCR processing statistics");

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
    } catch (error) {
      logger.error("Failed to retrieve OCR processing statistics:", error);
      throw error;
    }
  }

  /**
   * Gets documents that need OCR retry based on failure conditions
   */
  async getDocumentsForRetry(maxRetries: number = 3): Promise<
    Array<{
      id: number;
      case_id: number;
      cloudinary_public_id: string;
      ocr_retry_count: number;
      ocr_error_details?: string;
      ocr_last_attempt?: Date;
    }>
  > {
    try {
      // This would typically use a database query to find documents that:
      // 1. Have OCR status 'failed'
      // 2. Have retry count less than maxRetries
      // 3. Last attempt was more than X minutes ago (to avoid immediate retries)

      logger.info(
        `Finding documents for OCR retry (max retries: ${maxRetries})`
      );

      // Placeholder return - in real implementation, execute appropriate SQL query
      return [];
    } catch (error) {
      logger.error("Failed to get documents for OCR retry:", error);
      throw error;
    }
  }

  /**
   * Cleans up old OCR error details and metadata for documents older than specified days
   */
  async cleanupOldOcrMetadata(olderThanDays: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      logger.info(
        `Cleaning up OCR metadata older than ${olderThanDays} days (before ${cutoffDate.toISOString()})`
      );

      // This would typically execute an UPDATE query to clear old error details
      // UPDATE documents SET ocr_error_details = NULL
      // WHERE ocr_last_attempt < $1 AND ocr_error_details IS NOT NULL

      // Placeholder return - in real implementation, return number of affected rows
      return 0;
    } catch (error) {
      logger.error("Failed to cleanup old OCR metadata:", error);
      throw error;
    }
  }

  /**
   * Validates OCR metadata before updating document
   */
  private validateOcrMetadata(metadata: Partial<DocumentOcrMetadata>): void {
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

// Export singleton instance
export const ocrMetadataService = new OcrMetadataService();
