import logger from "../utils/logger";

/**
 * Cloudinary service for file storage operations.
 * OCR functionality has been moved to the dedicated OCR system.
 * This service now focuses on file upload, storage, and URL management.
 */

// Note: OCR functions have been removed from this service.
// OCR processing is now handled by the dedicated OCR orchestrator system.
// See src/services/ocr/ for OCR-related functionality.

logger.info(
  "Cloudinary service loaded - OCR functions moved to OCR orchestrator"
);
