"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tesseractOcr = exports.TesseractOcrService = void 0;
const tesseract_js_1 = __importDefault(require("tesseract.js"));
const errorHandling_1 = require("./utils/errorHandling");
const ocrUtils_1 = require("./utils/ocrUtils");
const ocrConfig_1 = require("./ocrConfig");
const logger_1 = __importDefault(require("../../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TesseractOcrService {
    constructor() {
        this.method = "tesseract-ocr";
        this.worker = null;
        this.initializeWorker();
    }
    /**
     * Initializes Tesseract worker with configuration
     */
    async initializeWorker() {
        try {
            const config = ocrConfig_1.ocrConfig.getConfiguration();
            this.worker = await tesseract_js_1.default.createWorker(config.tesseract_language, 1, {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        logger_1.default.debug(`Tesseract progress: ${Math.round(m.progress * 100)}%`);
                    }
                },
                errorHandler: (err) => {
                    logger_1.default.error("Tesseract worker error:", err);
                },
            });
            // Configure OCR parameters
            await this.worker.setParameters({
                tessedit_ocr_engine_mode: config.tesseract_engine_mode === "OEM_LSTM_ONLY"
                    ? tesseract_js_1.default.OEM.LSTM_ONLY
                    : tesseract_js_1.default.OEM.TESSERACT_LSTM_COMBINED,
                tessedit_pageseg_mode: tesseract_js_1.default.PSM.AUTO,
            });
            logger_1.default.info("Tesseract worker initialized successfully");
        }
        catch (error) {
            logger_1.default.error("Failed to initialize Tesseract worker:", error);
            throw new errorHandling_1.EnhancedOcrError("Failed to initialize Tesseract OCR worker", this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, undefined, error);
        }
    }
    /**
     * Performs OCR on an image file
     */
    async recognizeText(filePath, options = {}) {
        const startTime = Date.now();
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Starting Tesseract OCR for: ${filePath}`);
            // Validate file
            await this.validateFile(filePath);
            // Ensure worker is ready
            if (!this.worker) {
                await this.initializeWorker();
            }
            // Configure worker for this recognition
            await this.configureWorker(options);
            try {
                // Perform OCR recognition
                const result = await this.worker.recognize(filePath);
                const processingTime = Date.now() - startTime;
                const sanitizedText = (0, ocrUtils_1.sanitizeExtractedText)(result.data.text);
                logger_1.default.info(`Tesseract OCR completed: ${sanitizedText.length} characters, confidence: ${result.data.confidence}%`);
                return {
                    text: sanitizedText,
                    confidence: result.data.confidence / 100,
                    processingTime,
                };
            }
            catch (error) {
                logger_1.default.error(`Tesseract OCR failed for ${filePath}:`, error);
                if (error instanceof Error && error.message.includes("timeout")) {
                    throw errorHandling_1.OcrErrorFactory.createProcessingError(this.method, errorHandling_1.OCR_ERROR_CODES.TIMEOUT, { filePath, processingTime: Date.now() - startTime }, error);
                }
                throw errorHandling_1.OcrErrorFactory.createProcessingError(this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, { filePath, processingTime: Date.now() - startTime }, error instanceof Error ? error : new Error(String(error)));
            }
        }, this.method, { filePath });
    }
    /**
     * Performs OCR on image buffer data
     */
    async recognizeBuffer(imageBuffer, options = {}) {
        const startTime = Date.now();
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Starting Tesseract OCR on buffer: ${imageBuffer.length} bytes`);
            // Ensure worker is ready
            if (!this.worker) {
                await this.initializeWorker();
            }
            // Configure worker for this recognition
            await this.configureWorker(options);
            try {
                // Perform OCR recognition on buffer
                const result = await this.worker.recognize(imageBuffer);
                const processingTime = Date.now() - startTime;
                const sanitizedText = (0, ocrUtils_1.sanitizeExtractedText)(result.data.text);
                logger_1.default.info(`Tesseract OCR completed: ${sanitizedText.length} characters, confidence: ${result.data.confidence}%`);
                return {
                    text: sanitizedText,
                    confidence: result.data.confidence / 100,
                    processingTime,
                };
            }
            catch (error) {
                logger_1.default.error("Tesseract OCR failed on buffer:", error);
                throw errorHandling_1.OcrErrorFactory.createProcessingError(this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, {
                    bufferSize: imageBuffer.length,
                    processingTime: Date.now() - startTime,
                }, error);
            }
        }, this.method, { bufferSize: imageBuffer.length });
    }
    /**
     * Performs OCR with multiple engine modes for better accuracy
     */
    async recognizeWithFallback(filePath, options = {}) {
        const engineModes = [
            "OEM_LSTM_ONLY",
            "OEM_TESSERACT_LSTM_COMBINED",
        ];
        const pageSegModes = [
            "PSM_AUTO",
            "PSM_SINGLE_BLOCK",
            "PSM_SINGLE_LINE",
        ];
        let bestResult = null;
        let lastError = null;
        // Try different combinations of engine and page segmentation modes
        for (const engineMode of engineModes) {
            for (const pageSegMode of pageSegModes) {
                try {
                    const result = await this.recognizeText(filePath, {
                        ...options,
                        engineMode,
                        pageSegMode,
                    });
                    // Keep the result with highest confidence
                    if (!bestResult || result.confidence > bestResult.confidence) {
                        bestResult = result;
                    }
                    // If we get good confidence, return early
                    if (result.confidence > 0.8) {
                        logger_1.default.info(`High confidence result achieved: ${result.confidence}`);
                        return result;
                    }
                }
                catch (error) {
                    lastError = error;
                    logger_1.default.warn(`OCR attempt failed with ${engineMode}/${pageSegMode}:`, error);
                }
            }
        }
        if (bestResult) {
            logger_1.default.info(`Returning best result with confidence: ${bestResult.confidence}`);
            return bestResult;
        }
        // All attempts failed
        throw (lastError ||
            new errorHandling_1.EnhancedOcrError("All OCR attempts failed", this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED));
    }
    /**
     * Preprocesses image for better OCR accuracy
     */
    async preprocessAndRecognize(filePath, options = {}) {
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Preprocessing image for OCR: ${filePath}`);
            // For now, we'll use basic Tesseract recognition
            // In a full implementation, you would add image preprocessing here
            // using libraries like Sharp or Canvas for image manipulation
            const result = await this.recognizeText(filePath, options);
            // Assess quality and potentially retry with different settings
            const quality = (0, ocrUtils_1.assessTextQuality)(result.text, result.confidence);
            if (quality.containsGibberish && result.confidence < 0.6) {
                logger_1.default.info("Low quality result detected, attempting fallback recognition");
                return await this.recognizeWithFallback(filePath, options);
            }
            return result;
        }, this.method, { filePath });
    }
    /**
     * Validates input file for OCR processing
     */
    async validateFile(filePath) {
        try {
            const stats = await fs_1.default.promises.stat(filePath);
            if (!stats.isFile()) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.FILE_NOT_FOUND, filePath);
            }
            // Check file size (max 20MB for Tesseract)
            const maxSize = 20 * 1024 * 1024; // 20MB
            if (stats.size > maxSize) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.FILE_TOO_LARGE, filePath);
            }
            // Check file extension
            const ext = path_1.default.extname(filePath).toLowerCase();
            const supportedFormats = [
                ".jpg",
                ".jpeg",
                ".png",
                ".tiff",
                ".tif",
                ".bmp",
                ".webp",
            ];
            if (!supportedFormats.includes(ext)) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.UNSUPPORTED_FORMAT, filePath);
            }
        }
        catch (error) {
            if (error instanceof errorHandling_1.EnhancedOcrError) {
                throw error;
            }
            throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.FILE_NOT_FOUND, filePath, error);
        }
    }
    /**
     * Configures Tesseract worker with provided options
     */
    async configureWorker(options) {
        if (!this.worker)
            return;
        try {
            const config = ocrConfig_1.ocrConfig.getConfiguration();
            // Set language if different from default
            if (options.language && options.language !== config.tesseract_language) {
                await this.worker.reinitialize(options.language);
            }
            // Set engine mode
            if (options.engineMode) {
                const engineMode = options.engineMode === "OEM_LSTM_ONLY"
                    ? tesseract_js_1.default.OEM.LSTM_ONLY
                    : tesseract_js_1.default.OEM.TESSERACT_LSTM_COMBINED;
                await this.worker.setParameters({
                    tessedit_ocr_engine_mode: engineMode,
                });
            }
            // Set page segmentation mode
            if (options.pageSegMode) {
                let pageSegMode;
                switch (options.pageSegMode) {
                    case "PSM_SINGLE_BLOCK":
                        pageSegMode = tesseract_js_1.default.PSM.SINGLE_BLOCK;
                        break;
                    case "PSM_SINGLE_LINE":
                        pageSegMode = tesseract_js_1.default.PSM.SINGLE_LINE;
                        break;
                    default:
                        pageSegMode = tesseract_js_1.default.PSM.AUTO;
                }
                await this.worker.setParameters({
                    tessedit_pageseg_mode: pageSegMode,
                });
            }
        }
        catch (error) {
            logger_1.default.error("Failed to configure Tesseract worker:", error);
            throw new errorHandling_1.EnhancedOcrError("Failed to configure OCR worker", this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, undefined, error);
        }
    }
    /**
     * Gets supported languages for OCR
     */
    async getSupportedLanguages() {
        // Common Tesseract language codes
        return [
            "eng",
            "spa",
            "fra",
            "deu",
            "ita",
            "por",
            "rus",
            "chi_sim",
            "chi_tra",
            "jpn",
            "kor",
            "ara",
            "hin", // Hindi
        ];
    }
    /**
     * Cleans up Tesseract worker resources
     */
    async cleanup() {
        if (this.worker) {
            try {
                await this.worker.terminate();
                this.worker = null;
                logger_1.default.info("Tesseract worker terminated successfully");
            }
            catch (error) {
                logger_1.default.error("Error terminating Tesseract worker:", error);
            }
        }
    }
    /**
     * Reinitializes the worker (useful for configuration changes)
     */
    async reinitialize() {
        await this.cleanup();
        await this.initializeWorker();
    }
}
exports.TesseractOcrService = TesseractOcrService;
// Export singleton instance
exports.tesseractOcr = new TesseractOcrService();
//# sourceMappingURL=tesseractOcr.service.js.map