"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDocumentOcrMetadata = exports.validateOcrResult = exports.validateTesseractOptions = exports.validateOcrOptions = exports.validateOcrConfiguration = exports.OcrErrorRecoverySchema = exports.SupportedFileExtensionSchema = exports.OcrMethodSchema = exports.DocumentTypeSchema = exports.TesseractResultSchema = exports.PdfExtractionResultSchema = exports.OcrResultSchema = exports.DocumentOcrMetadataSchema = exports.TesseractOptionsSchema = exports.OcrOptionsSchema = exports.OcrConfigurationSchema = void 0;
const zod_1 = require("zod");
// OCR Configuration validation schema
exports.OcrConfigurationSchema = zod_1.z.object({
    pdf_extraction_enabled: zod_1.z.boolean(),
    tesseract_enabled: zod_1.z.boolean(),
    cloudinary_fallback_enabled: zod_1.z.boolean(),
    default_timeout: zod_1.z.number().min(1000).max(300000),
    max_retry_attempts: zod_1.z.number().min(0).max(10),
    tesseract_language: zod_1.z.string().min(2).max(10),
    tesseract_engine_mode: zod_1.z.enum([
        "OEM_LSTM_ONLY",
        "OEM_TESSERACT_LSTM_COMBINED",
    ]),
    pdf_render_dpi: zod_1.z.number().min(72).max(600), // 72 to 600 DPI
});
// OCR Options validation schema
exports.OcrOptionsSchema = zod_1.z.object({
    enablePdfExtraction: zod_1.z.boolean(),
    enableTesseractOcr: zod_1.z.boolean(),
    enableCloudinaryFallback: zod_1.z.boolean(),
    timeout: zod_1.z.number().min(1000).max(300000),
    retryAttempts: zod_1.z.number().min(0).max(10),
});
// Tesseract Options validation schema
exports.TesseractOptionsSchema = zod_1.z.object({
    language: zod_1.z.string().min(2).max(10),
    engineMode: zod_1.z.enum(["OEM_LSTM_ONLY", "OEM_TESSERACT_LSTM_COMBINED"]),
    pageSegMode: zod_1.z.enum(["PSM_AUTO", "PSM_SINGLE_BLOCK", "PSM_SINGLE_LINE"]),
});
// Document OCR Metadata validation schema
exports.DocumentOcrMetadataSchema = zod_1.z.object({
    ocr_method_used: zod_1.z.string().optional(),
    ocr_confidence: zod_1.z.number().min(0).max(1).optional(),
    ocr_processing_time: zod_1.z.number().min(0).optional(),
    ocr_retry_count: zod_1.z.number().min(0).optional(),
    ocr_error_details: zod_1.z.string().optional(),
    ocr_last_attempt: zod_1.z.date().optional(),
});
// OCR Result validation schema
exports.OcrResultSchema = zod_1.z.object({
    text: zod_1.z.string(),
    method: zod_1.z.enum(["pdf-extraction", "tesseract-ocr", "cloudinary-fallback"]),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    processingTime: zod_1.z.number().min(0),
    metadata: zod_1.z
        .object({
        pageCount: zod_1.z.number().min(0).optional(),
        imageCount: zod_1.z.number().min(0).optional(),
        errors: zod_1.z.array(zod_1.z.string()).optional(),
    })
        .optional(),
});
// PDF Extraction Result validation schema
exports.PdfExtractionResultSchema = zod_1.z.object({
    text: zod_1.z.string(),
    pageCount: zod_1.z.number().min(0),
    hasSelectableText: zod_1.z.boolean(),
    extractionMethod: zod_1.z.enum(["native-text", "rendered-text"]),
});
// Tesseract Result validation schema
exports.TesseractResultSchema = zod_1.z.object({
    text: zod_1.z.string(),
    confidence: zod_1.z.number().min(0).max(1),
    processingTime: zod_1.z.number().min(0),
});
// Document type validation
exports.DocumentTypeSchema = zod_1.z.enum(["pdf", "image", "unknown"]);
// OCR Method validation
exports.OcrMethodSchema = zod_1.z.enum([
    "pdf-extraction",
    "tesseract-ocr",
    "cloudinary-fallback",
]);
// File extension validation
exports.SupportedFileExtensionSchema = zod_1.z.enum([
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
exports.OcrErrorRecoverySchema = zod_1.z.object({
    maxRetries: zod_1.z.number().min(0).max(10),
    backoffStrategy: zod_1.z.enum(["linear", "exponential"]),
    fallbackChain: zod_1.z.array(exports.OcrMethodSchema),
    timeoutHandling: zod_1.z.object({
        initialTimeout: zod_1.z.number().min(1000),
        maxTimeout: zod_1.z.number().min(5000),
        timeoutMultiplier: zod_1.z.number().min(1).max(5),
    }),
});
// Validation helper functions
const validateOcrConfiguration = (config) => {
    return exports.OcrConfigurationSchema.safeParse(config);
};
exports.validateOcrConfiguration = validateOcrConfiguration;
const validateOcrOptions = (options) => {
    return exports.OcrOptionsSchema.safeParse(options);
};
exports.validateOcrOptions = validateOcrOptions;
const validateTesseractOptions = (options) => {
    return exports.TesseractOptionsSchema.safeParse(options);
};
exports.validateTesseractOptions = validateTesseractOptions;
const validateOcrResult = (result) => {
    return exports.OcrResultSchema.safeParse(result);
};
exports.validateOcrResult = validateOcrResult;
const validateDocumentOcrMetadata = (metadata) => {
    return exports.DocumentOcrMetadataSchema.safeParse(metadata);
};
exports.validateDocumentOcrMetadata = validateDocumentOcrMetadata;
//# sourceMappingURL=validation.schemas.js.map