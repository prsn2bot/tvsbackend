import { z } from "zod";

// OCR Configuration validation schema
export const OcrConfigurationSchema = z.object({
  pdf_extraction_enabled: z.boolean(),
  tesseract_enabled: z.boolean(),
  cloudinary_fallback_enabled: z.boolean(),
  default_timeout: z.number().min(1000).max(300000), // 1s to 5min
  max_retry_attempts: z.number().min(0).max(10),
  tesseract_language: z.string().min(2).max(10),
  tesseract_engine_mode: z.enum([
    "OEM_LSTM_ONLY",
    "OEM_TESSERACT_LSTM_COMBINED",
  ]),
  pdf_render_dpi: z.number().min(72).max(600), // 72 to 600 DPI
});

// OCR Options validation schema
export const OcrOptionsSchema = z.object({
  enablePdfExtraction: z.boolean(),
  enableTesseractOcr: z.boolean(),
  enableCloudinaryFallback: z.boolean(),
  timeout: z.number().min(1000).max(300000),
  retryAttempts: z.number().min(0).max(10),
});

// Tesseract Options validation schema
export const TesseractOptionsSchema = z.object({
  language: z.string().min(2).max(10),
  engineMode: z.enum(["OEM_LSTM_ONLY", "OEM_TESSERACT_LSTM_COMBINED"]),
  pageSegMode: z.enum(["PSM_AUTO", "PSM_SINGLE_BLOCK", "PSM_SINGLE_LINE"]),
});

// Document OCR Metadata validation schema
export const DocumentOcrMetadataSchema = z.object({
  ocr_method_used: z.string().optional(),
  ocr_confidence: z.number().min(0).max(1).optional(),
  ocr_processing_time: z.number().min(0).optional(),
  ocr_retry_count: z.number().min(0).optional(),
  ocr_error_details: z.string().optional(),
  ocr_last_attempt: z.date().optional(),
});

// OCR Result validation schema
export const OcrResultSchema = z.object({
  text: z.string(),
  method: z.enum(["pdf-extraction", "tesseract-ocr", "cloudinary-fallback"]),
  confidence: z.number().min(0).max(1).optional(),
  processingTime: z.number().min(0),
  metadata: z
    .object({
      pageCount: z.number().min(0).optional(),
      imageCount: z.number().min(0).optional(),
      errors: z.array(z.string()).optional(),
    })
    .optional(),
});

// PDF Extraction Result validation schema
export const PdfExtractionResultSchema = z.object({
  text: z.string(),
  pageCount: z.number().min(0),
  hasSelectableText: z.boolean(),
  extractionMethod: z.enum(["native-text", "rendered-text"]),
});

// Tesseract Result validation schema
export const TesseractResultSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  processingTime: z.number().min(0),
});

// Document type validation
export const DocumentTypeSchema = z.enum(["pdf", "image", "unknown"]);

// OCR Method validation
export const OcrMethodSchema = z.enum([
  "pdf-extraction",
  "tesseract-ocr",
  "cloudinary-fallback",
]);

// File extension validation
export const SupportedFileExtensionSchema = z.enum([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "tiff",
  "tif",
  "bmp",
  "webp",
]);

// Error recovery configuration validation
export const OcrErrorRecoverySchema = z.object({
  maxRetries: z.number().min(0).max(10),
  backoffStrategy: z.enum(["linear", "exponential"]),
  fallbackChain: z.array(OcrMethodSchema),
  timeoutHandling: z.object({
    initialTimeout: z.number().min(1000),
    maxTimeout: z.number().min(5000),
    timeoutMultiplier: z.number().min(1).max(5),
  }),
});

// Validation helper functions
export const validateOcrConfiguration = (config: unknown) => {
  return OcrConfigurationSchema.safeParse(config);
};

export const validateOcrOptions = (options: unknown) => {
  return OcrOptionsSchema.safeParse(options);
};

export const validateTesseractOptions = (options: unknown) => {
  return TesseractOptionsSchema.safeParse(options);
};

export const validateOcrResult = (result: unknown) => {
  return OcrResultSchema.safeParse(result);
};

export const validateDocumentOcrMetadata = (metadata: unknown) => {
  return DocumentOcrMetadataSchema.safeParse(metadata);
};
