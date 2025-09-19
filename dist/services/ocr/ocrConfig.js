"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrConfig = void 0;
const logger_1 = __importDefault(require("../../utils/logger"));
class OcrConfigService {
    constructor() {
        this.config = this.loadConfiguration();
    }
    loadConfiguration() {
        return {
            pdf_extraction_enabled: process.env.OCR_PDF_EXTRACTION_ENABLED === "true" || true,
            tesseract_enabled: process.env.OCR_TESSERACT_ENABLED === "true" || true,
            cloudinary_fallback_enabled: process.env.OCR_CLOUDINARY_FALLBACK_ENABLED === "true" || false,
            default_timeout: parseInt(process.env.OCR_DEFAULT_TIMEOUT || "30000"),
            max_retry_attempts: parseInt(process.env.OCR_MAX_RETRY_ATTEMPTS || "3"),
            tesseract_language: process.env.OCR_TESSERACT_LANGUAGE || "eng",
            tesseract_engine_mode: process.env.OCR_TESSERACT_ENGINE_MODE || "OEM_LSTM_ONLY",
            pdf_render_dpi: parseInt(process.env.OCR_PDF_RENDER_DPI || "150"),
        };
    }
    getConfiguration() {
        return { ...this.config };
    }
    updateConfiguration(updates) {
        this.config = { ...this.config, ...updates };
        logger_1.default.info("OCR configuration updated", { updates });
    }
    reloadConfiguration() {
        this.config = this.loadConfiguration();
        logger_1.default.info("OCR configuration reloaded from environment");
    }
    validateConfiguration() {
        const config = this.config;
        if (config.default_timeout <= 0) {
            logger_1.default.error("Invalid OCR timeout configuration");
            return false;
        }
        if (config.max_retry_attempts < 0) {
            logger_1.default.error("Invalid OCR retry attempts configuration");
            return false;
        }
        if (config.pdf_render_dpi <= 0) {
            logger_1.default.error("Invalid PDF render DPI configuration");
            return false;
        }
        if (!config.pdf_extraction_enabled &&
            !config.tesseract_enabled &&
            !config.cloudinary_fallback_enabled) {
            logger_1.default.error("At least one OCR method must be enabled");
            return false;
        }
        return true;
    }
    isMethodEnabled(method) {
        switch (method) {
            case "pdf-extraction":
                return this.config.pdf_extraction_enabled;
            case "tesseract-ocr":
                return this.config.tesseract_enabled;
            case "cloudinary-fallback":
                return this.config.cloudinary_fallback_enabled;
            default:
                return false;
        }
    }
}
exports.ocrConfig = new OcrConfigService();
//# sourceMappingURL=ocrConfig.js.map