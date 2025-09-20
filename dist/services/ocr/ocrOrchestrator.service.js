"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrOrchestrator = exports.OcrOrchestrator = void 0;
const ocr_types_1 = require("./types/ocr.types");
const ocrConfig_1 = require("./ocrConfig");
const logger_1 = __importDefault(require("../../utils/logger"));
class OcrOrchestrator {
    constructor() {
        const config = ocrConfig_1.ocrConfig.getConfiguration();
        this.defaultOptions = {
            enablePdfExtraction: config.pdf_extraction_enabled,
            enableTesseractOcr: config.tesseract_enabled,
            timeout: config.default_timeout,
            retryAttempts: config.max_retry_attempts,
        };
    }
    /**
     * Main OCR processing method that coordinates between different OCR approaches
     * @param documentUrl - URL or path to the document to process
     * @param options - OCR processing options
     * @returns Promise<OcrResult> - The extracted text and metadata
     */
    async extractText(documentUrl, options = {}) {
        const mergedOptions = { ...this.defaultOptions, ...options };
        const startTime = Date.now();
        logger_1.default.info(`Starting OCR extraction for document: ${documentUrl}`);
        // Validate configuration
        if (!ocrConfig_1.ocrConfig.validateConfiguration()) {
            throw new ocr_types_1.OcrError("Invalid OCR configuration", "pdf-extraction", undefined, false);
        }
        // Determine document type and processing strategy
        const documentType = this.getDocumentType(documentUrl);
        const processingChain = this.buildProcessingChain(documentType, mergedOptions);
        if (processingChain.length === 0) {
            throw new ocr_types_1.OcrError("No OCR methods available", "pdf-extraction", undefined, false);
        }
        // Execute OCR processing chain with fallback
        let lastError;
        for (const method of processingChain) {
            try {
                logger_1.default.info(`Attempting OCR extraction using method: ${method}`);
                const result = await this.executeOcrMethod(method, documentUrl, mergedOptions);
                const processingTime = Date.now() - startTime;
                logger_1.default.info(`OCR extraction successful using ${method} in ${processingTime}ms`);
                return {
                    ...result,
                    method,
                    processingTime,
                };
            }
            catch (error) {
                lastError = error;
                logger_1.default.warn(`OCR method ${method} failed: ${lastError.message}`);
                // If this is a non-retryable error, don't try other methods
                if (error instanceof ocr_types_1.OcrError && !error.retryable) {
                    break;
                }
            }
        }
        // All methods failed
        const processingTime = Date.now() - startTime;
        throw new ocr_types_1.OcrError(`All OCR methods failed. Last error: ${lastError?.message}`, processingChain[processingChain.length - 1], lastError, false);
    }
    getDocumentType(documentUrl) {
        let detectedType = "unknown";
        // Check for Cloudinary raw upload URLs (typically PDFs)
        if (documentUrl.includes("cloudinary.com") &&
            documentUrl.includes("/raw/upload/")) {
            detectedType = "pdf";
        }
        // Check for Cloudinary image upload URLs
        else if (documentUrl.includes("cloudinary.com") &&
            documentUrl.includes("/image/upload/")) {
            detectedType = "image";
        }
        else {
            const extension = documentUrl.toLowerCase().split(".").pop();
            if (extension === "pdf") {
                detectedType = "pdf";
            }
            else if (["jpg", "jpeg", "png", "tiff", "bmp", "webp"].includes(extension || "")) {
                detectedType = "image";
            }
        }
        logger_1.default.info(`Document type detected for ${documentUrl}: ${detectedType}`);
        return detectedType;
    }
    buildProcessingChain(documentType, options) {
        const chain = [];
        logger_1.default.info(`Building processing chain for document type: ${documentType}`);
        if (documentType === "pdf" && options.enablePdfExtraction) {
            chain.push("pdf-extraction");
            logger_1.default.info("Added pdf-extraction to processing chain");
        }
        // Only use Tesseract for image files or unknown types that might be images
        if (options.enableTesseractOcr && documentType !== "pdf") {
            chain.push("tesseract-ocr");
            logger_1.default.info("Added tesseract-ocr to processing chain");
        }
        logger_1.default.info(`Final processing chain: ${chain.join(", ")}`);
        return chain;
    }
    async executeOcrMethod(method, documentUrl, options) {
        const { pdfExtractor } = await Promise.resolve().then(() => __importStar(require("./pdfExtractor.service")));
        const { tesseractOcr } = await Promise.resolve().then(() => __importStar(require("./tesseractOcr.service")));
        const { pdfToImageConverter } = await Promise.resolve().then(() => __importStar(require("./pdfToImageConverter.service")));
        switch (method) {
            case "pdf-extraction":
                return await this.executePdfExtraction(documentUrl, options, pdfExtractor, pdfToImageConverter, tesseractOcr);
            case "tesseract-ocr":
                return await this.executeTesseractOcr(documentUrl, options, tesseractOcr);
            default:
                throw new ocr_types_1.OcrError(`Unknown OCR method: ${method}`, method, undefined, false);
        }
    }
    async executePdfExtraction(documentUrl, options, pdfExtractor, pdfToImageConverter, tesseractOcr) {
        try {
            // First attempt: Extract native text from PDF
            const pdfResult = await pdfExtractor.extractText(documentUrl, {
                qualityThreshold: 0.5,
                enableFallbackRendering: false,
            });
            // Check if we got good quality text
            if (pdfResult.text.length > 50 && pdfResult.hasSelectableText) {
                return {
                    text: pdfResult.text,
                    confidence: 0.9,
                    metadata: {
                        pageCount: pdfResult.pageCount,
                        processingSteps: ["pdf-native-text-extraction"],
                    },
                };
            }
            // Fallback: Convert PDF to images and use Tesseract OCR
            logger_1.default.info("PDF has minimal text, attempting image conversion + OCR");
            const conversionResult = await pdfToImageConverter.convertPdfToImages(documentUrl, {
                dpi: 150,
                format: "png",
                maxPages: 5, // Limit to first 5 pages for performance
            });
            const ocrResults = [];
            let totalConfidence = 0;
            for (const page of conversionResult.pages) {
                try {
                    const tesseractResult = await tesseractOcr.recognizeBuffer(page.imageBuffer);
                    if (tesseractResult.text.trim().length > 0) {
                        ocrResults.push(tesseractResult.text);
                        totalConfidence += tesseractResult.confidence;
                    }
                }
                catch (error) {
                    logger_1.default.warn(`Failed to OCR page ${page.pageNumber}:`, error);
                }
            }
            const combinedText = ocrResults.join("\n\n");
            const averageConfidence = ocrResults.length > 0 ? totalConfidence / ocrResults.length : 0;
            return {
                text: combinedText,
                confidence: averageConfidence,
                metadata: {
                    pageCount: conversionResult.totalPages,
                    imageCount: conversionResult.pages.length,
                    processingSteps: ["pdf-to-image-conversion", "tesseract-ocr"],
                },
            };
        }
        catch (error) {
            throw new ocr_types_1.OcrError(`PDF extraction failed: ${error instanceof Error ? error.message : "Unknown error"}`, "pdf-extraction", error instanceof Error ? error : undefined);
        }
    }
    async executeTesseractOcr(documentUrl, options, tesseractOcr) {
        // Safety check: Don't use Tesseract for PDF files
        const docType = this.getDocumentType(documentUrl);
        if (docType === "pdf") {
            throw new ocr_types_1.OcrError(`Tesseract OCR cannot process PDF files directly: ${documentUrl}`, "tesseract-ocr", undefined, false);
        }
        try {
            logger_1.default.info(`Executing Tesseract OCR for ${docType} document: ${documentUrl}`);
            // Use Tesseract with fallback for better accuracy
            const result = await tesseractOcr.preprocessAndRecognize(documentUrl, {
                enhanceContrast: true,
                removeNoise: true,
            });
            return {
                text: result.text,
                confidence: result.confidence,
                metadata: {
                    processingSteps: ["tesseract-ocr-with-preprocessing"],
                },
            };
        }
        catch (error) {
            throw new ocr_types_1.OcrError(`Tesseract OCR failed: ${error instanceof Error ? error.message : "Unknown error"}`, "tesseract-ocr", error instanceof Error ? error : undefined);
        }
    }
    /**
     * Processes a document with performance monitoring and quality assessment
     */
    async processDocumentWithMetrics(documentUrl, options = {}) {
        const startTime = Date.now();
        const mergedOptions = { ...this.defaultOptions, ...options };
        try {
            const result = await this.extractText(documentUrl, mergedOptions);
            // Import quality assessment utility
            const { assessTextQuality } = await Promise.resolve().then(() => __importStar(require("./utils/ocrUtils")));
            const qualityAssessment = assessTextQuality(result.text, result.confidence);
            const performanceMetrics = {
                totalProcessingTime: result.processingTime,
                method: result.method,
                confidence: result.confidence,
                textLength: result.text.length,
                qualityScore: qualityAssessment.estimatedAccuracy,
                timestamp: new Date(),
            };
            logger_1.default.info("Document processing completed with metrics", {
                method: result.method,
                processingTime: result.processingTime,
                textLength: result.text.length,
                confidence: result.confidence,
            });
            return {
                ...result,
                qualityAssessment,
                performanceMetrics,
            };
        }
        catch (error) {
            const processingTime = Date.now() - startTime;
            logger_1.default.error("Document processing failed", {
                documentUrl,
                processingTime,
                error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
        }
    }
    /**
     * Batch processes multiple documents
     */
    async processDocumentsBatch(documentUrls, options = {}) {
        logger_1.default.info(`Starting batch processing of ${documentUrls.length} documents`);
        const results = await Promise.allSettled(documentUrls.map(async (url) => {
            try {
                const result = await this.extractText(url, options);
                return { documentUrl: url, result };
            }
            catch (error) {
                return { documentUrl: url, error: error };
            }
        }));
        return results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            }
            else {
                return {
                    documentUrl: documentUrls[index],
                    error: result.reason,
                };
            }
        });
    }
    /**
     * Gets processing statistics and health metrics
     */
    getProcessingStats() {
        const config = ocrConfig_1.ocrConfig.getConfiguration();
        const availableMethods = [];
        if (config.pdf_extraction_enabled) {
            availableMethods.push("pdf-extraction");
        }
        if (config.tesseract_enabled) {
            availableMethods.push("tesseract-ocr");
        }
        let systemHealth = "healthy";
        if (availableMethods.length === 0) {
            systemHealth = "unhealthy";
        }
        else if (availableMethods.length === 1) {
            systemHealth = "degraded";
        }
        return {
            configurationStatus: config,
            availableMethods,
            systemHealth,
        };
    }
}
exports.OcrOrchestrator = OcrOrchestrator;
// Export singleton instance
exports.ocrOrchestrator = new OcrOrchestrator();
//# sourceMappingURL=ocrOrchestrator.service.js.map