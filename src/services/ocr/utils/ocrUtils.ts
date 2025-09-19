import {
  DocumentType,
  SupportedFileExtension,
  OcrQualityAssessment,
  OcrMethodCapabilities,
  OcrMethodsConfig,
  OcrRetryStrategy,
  OcrError,
  OcrMethod,
} from "../types/ocr.types";

/**
 * Determines document type based on file extension or MIME type
 */
export function getDocumentType(
  filePathOrUrl: string,
  mimeType?: string
): DocumentType {
  // Check MIME type first if available
  if (mimeType) {
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
  }

  // Fall back to file extension
  const extension = filePathOrUrl
    .toLowerCase()
    .split(".")
    .pop() as SupportedFileExtension;

  if (extension === "pdf") {
    return "pdf";
  } else if (
    ["jpg", "jpeg", "png", "tiff", "tif", "bmp", "webp"].includes(extension)
  ) {
    return "image";
  }

  return "unknown";
}

/**
 * Validates if a file extension is supported for OCR processing
 */
export function isSupportedFileType(
  extension: string
): extension is SupportedFileExtension {
  const supportedExtensions: SupportedFileExtension[] = [
    "pdf",
    "jpg",
    "jpeg",
    "png",
    "tiff",
    "tif",
    "bmp",
    "webp",
  ];
  return supportedExtensions.includes(
    extension.toLowerCase() as SupportedFileExtension
  );
}

/**
 * Assesses the quality of extracted OCR text
 */
export function assessTextQuality(
  text: string,
  confidence?: number
): OcrQualityAssessment {
  const textLength = text.length;
  const hasValidText = textLength > 0 && text.trim().length > 0;

  // Basic gibberish detection
  const words = text.split(/\s+/);
  const validWords = words.filter(
    (word) => word.length > 1 && /^[a-zA-Z0-9\s.,!?;:'"()-]+$/.test(word)
  );
  const validWordRatio =
    words.length > 0 ? validWords.length / words.length : 0;

  // Estimate accuracy based on various factors
  let estimatedAccuracy = 0.5; // Base accuracy

  if (confidence !== undefined) {
    estimatedAccuracy = confidence;
  } else {
    // Heuristic-based accuracy estimation
    if (validWordRatio > 0.8) estimatedAccuracy += 0.3;
    if (textLength > 100) estimatedAccuracy += 0.1;
    if (/[A-Z][a-z]+/.test(text)) estimatedAccuracy += 0.1; // Has proper capitalization
  }

  estimatedAccuracy = Math.min(1, Math.max(0, estimatedAccuracy));

  return {
    textLength,
    hasValidText,
    confidence: confidence || estimatedAccuracy,
    estimatedAccuracy,
    containsGibberish: validWordRatio < 0.5,
    languageDetected: detectLanguage(text),
  };
}

/**
 * Simple language detection based on character patterns
 */
function detectLanguage(text: string): string {
  // Very basic language detection - in production, use a proper library
  const sample = text.substring(0, 200).toLowerCase();

  // English indicators
  if (/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/.test(sample)) {
    return "en";
  }

  // Default to English if uncertain
  return "en";
}

/**
 * Creates a default retry strategy for OCR operations
 */
export function createDefaultRetryStrategy(
  maxAttempts: number = 3
): OcrRetryStrategy {
  return {
    shouldRetry: (error: OcrError, attemptCount: number) => {
      return error.retryable && attemptCount < maxAttempts;
    },
    getRetryDelay: (attemptCount: number) => {
      // Exponential backoff: 1s, 2s, 4s, 8s...
      return Math.min(1000 * Math.pow(2, attemptCount - 1), 10000);
    },
    maxAttempts,
  };
}

/**
 * Default OCR method capabilities configuration
 */
export const DEFAULT_OCR_METHODS_CONFIG: OcrMethodsConfig = {
  "pdf-extraction": {
    supportedFormats: ["pdf"],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    averageProcessingTime: 2000, // 2 seconds
    reliability: 0.95,
    qualityScore: 0.9,
  },
  "tesseract-ocr": {
    supportedFormats: [
      "jpg",
      "jpeg",
      "png",
      "tiff",
      "tif",
      "bmp",
      "webp",
      "pdf",
    ],
    maxFileSize: 20 * 1024 * 1024, // 20MB
    averageProcessingTime: 8000, // 8 seconds
    reliability: 0.8,
    qualityScore: 0.75,
  },
  "cloudinary-fallback": {
    supportedFormats: [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "tiff",
      "tif",
      "bmp",
      "webp",
    ],
    maxFileSize: 100 * 1024 * 1024, // 100MB
    averageProcessingTime: 5000, // 5 seconds
    reliability: 0.85,
    qualityScore: 0.8,
  },
};

/**
 * Determines the best OCR method for a given document type and file size
 */
export function selectOptimalOcrMethod(
  documentType: DocumentType,
  fileSize: number,
  availableMethods: OcrMethod[]
): OcrMethod[] {
  const config = DEFAULT_OCR_METHODS_CONFIG;

  // Filter methods that support the document type and file size
  const suitableMethods = availableMethods.filter((method) => {
    const methodConfig = config[method];
    const supportsType =
      documentType === "pdf"
        ? methodConfig.supportedFormats.includes("pdf")
        : methodConfig.supportedFormats.some((format) => format !== "pdf");

    return supportsType && fileSize <= methodConfig.maxFileSize;
  });

  // Sort by reliability and quality score
  return suitableMethods.sort((a, b) => {
    const scoreA = config[a].reliability * config[a].qualityScore;
    const scoreB = config[b].reliability * config[b].qualityScore;
    return scoreB - scoreA; // Descending order
  });
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Sanitizes extracted text by removing excessive whitespace and control characters
 */
export function sanitizeExtractedText(text: string): string {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Validates OCR result completeness and quality
 */
export function validateOcrTextQuality(
  text: string,
  minLength: number = 10,
  minQuality: number = 0.5
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!text || text.trim().length === 0) {
    issues.push("No text extracted");
  }

  if (text.length < minLength) {
    issues.push(`Text too short (${text.length} < ${minLength} characters)`);
  }

  const quality = assessTextQuality(text);
  if (quality.estimatedAccuracy < minQuality) {
    issues.push(
      `Quality too low (${quality.estimatedAccuracy.toFixed(
        2
      )} < ${minQuality})`
    );
  }

  if (quality.containsGibberish) {
    issues.push("Text appears to contain gibberish");
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
