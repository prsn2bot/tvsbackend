"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOcrTextQuality = exports.sanitizeExtractedText = exports.formatFileSize = exports.selectOptimalOcrMethod = exports.DEFAULT_OCR_METHODS_CONFIG = exports.createDefaultRetryStrategy = exports.assessTextQuality = exports.isSupportedFileType = exports.getDocumentType = void 0;
/**
 * Determines document type based on file extension or MIME type
 */
function getDocumentType(filePathOrUrl, mimeType) {
    // Check MIME type first if available
    if (mimeType) {
        if (mimeType === "application/pdf")
            return "pdf";
        if (mimeType.startsWith("image/"))
            return "image";
    }
    // Fall back to file extension
    const extension = filePathOrUrl
        .toLowerCase()
        .split(".")
        .pop();
    if (extension === "pdf") {
        return "pdf";
    }
    else if (["jpg", "jpeg", "png", "tiff", "tif", "bmp", "webp"].includes(extension)) {
        return "image";
    }
    return "unknown";
}
exports.getDocumentType = getDocumentType;
/**
 * Validates if a file extension is supported for OCR processing
 */
function isSupportedFileType(extension) {
    const supportedExtensions = [
        "pdf",
        "jpg",
        "jpeg",
        "png",
        "tiff",
        "tif",
        "bmp",
        "webp",
    ];
    return supportedExtensions.includes(extension.toLowerCase());
}
exports.isSupportedFileType = isSupportedFileType;
/**
 * Assesses the quality of extracted OCR text
 */
function assessTextQuality(text, confidence) {
    const textLength = text.length;
    const hasValidText = textLength > 0 && text.trim().length > 0;
    // Basic gibberish detection
    const words = text.split(/\s+/);
    const validWords = words.filter((word) => word.length > 1 && /^[a-zA-Z0-9\s.,!?;:'"()-]+$/.test(word));
    const validWordRatio = words.length > 0 ? validWords.length / words.length : 0;
    // Estimate accuracy based on various factors
    let estimatedAccuracy = 0.5; // Base accuracy
    if (confidence !== undefined) {
        estimatedAccuracy = confidence;
    }
    else {
        // Heuristic-based accuracy estimation
        if (validWordRatio > 0.8)
            estimatedAccuracy += 0.3;
        if (textLength > 100)
            estimatedAccuracy += 0.1;
        if (/[A-Z][a-z]+/.test(text))
            estimatedAccuracy += 0.1; // Has proper capitalization
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
exports.assessTextQuality = assessTextQuality;
/**
 * Simple language detection based on character patterns
 */
function detectLanguage(text) {
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
function createDefaultRetryStrategy(maxAttempts = 3) {
    return {
        shouldRetry: (error, attemptCount) => {
            return error.retryable && attemptCount < maxAttempts;
        },
        getRetryDelay: (attemptCount) => {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            return Math.min(1000 * Math.pow(2, attemptCount - 1), 10000);
        },
        maxAttempts,
    };
}
exports.createDefaultRetryStrategy = createDefaultRetryStrategy;
/**
 * Default OCR method capabilities configuration
 */
exports.DEFAULT_OCR_METHODS_CONFIG = {
    "pdf-extraction": {
        supportedFormats: ["pdf"],
        maxFileSize: 50 * 1024 * 1024,
        averageProcessingTime: 2000,
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
        maxFileSize: 20 * 1024 * 1024,
        averageProcessingTime: 8000,
        reliability: 0.8,
        qualityScore: 0.75,
    },
};
/**
 * Determines the best OCR method for a given document type and file size
 */
function selectOptimalOcrMethod(documentType, fileSize, availableMethods) {
    const config = exports.DEFAULT_OCR_METHODS_CONFIG;
    // Filter methods that support the document type and file size
    const suitableMethods = availableMethods.filter((method) => {
        const methodConfig = config[method];
        const supportsType = documentType === "pdf"
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
exports.selectOptimalOcrMethod = selectOptimalOcrMethod;
/**
 * Formats file size in human-readable format
 */
function formatFileSize(bytes) {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}
exports.formatFileSize = formatFileSize;
/**
 * Sanitizes extracted text by removing excessive whitespace and control characters
 */
function sanitizeExtractedText(text) {
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim();
}
exports.sanitizeExtractedText = sanitizeExtractedText;
/**
 * Validates OCR result completeness and quality
 */
function validateOcrTextQuality(text, minLength = 10, minQuality = 0.5) {
    const issues = [];
    if (!text || text.trim().length === 0) {
        issues.push("No text extracted");
    }
    if (text.length < minLength) {
        issues.push(`Text too short (${text.length} < ${minLength} characters)`);
    }
    const quality = assessTextQuality(text);
    if (quality.estimatedAccuracy < minQuality) {
        issues.push(`Quality too low (${quality.estimatedAccuracy.toFixed(2)} < ${minQuality})`);
    }
    if (quality.containsGibberish) {
        issues.push("Text appears to contain gibberish");
    }
    return {
        isValid: issues.length === 0,
        issues,
    };
}
exports.validateOcrTextQuality = validateOcrTextQuality;
//# sourceMappingURL=ocrUtils.js.map