"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Cloudinary service for file storage operations.
 * OCR functionality has been moved to the dedicated OCR system.
 * This service now focuses on file upload, storage, and URL management.
 */
// Note: OCR functions have been removed from this service.
// OCR processing is now handled by the dedicated OCR orchestrator system.
// See src/services/ocr/ for OCR-related functionality.
logger_1.default.info("Cloudinary service loaded - OCR functions moved to OCR orchestrator");
//# sourceMappingURL=cloudinary.service.js.map