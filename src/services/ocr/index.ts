// Main OCR services
export { ocrOrchestrator, OcrOrchestrator } from "./ocrOrchestrator.service";
export { ocrConfig } from "./ocrConfig";

// Types
export * from "./types/ocr.types";

// Validation schemas
export * from "./types/validation.schemas";

// Utilities
export * from "./utils/ocrUtils";
export {
  EnhancedOcrError,
  OcrErrorFactory,
  OcrErrorRecovery as ErrorRecovery,
  OCR_ERROR_CODES,
  withErrorHandling,
} from "./utils/errorHandling";

// Individual OCR services
export { pdfExtractor } from "./pdfExtractor.service";
export { tesseractOcr } from "./tesseractOcr.service";
export { pdfToImageConverter } from "./pdfToImageConverter.service";
export { ocrMetadataService } from "./ocrMetadata.service";
