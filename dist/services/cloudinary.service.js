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
exports.getEnhancedOcrText = exports.getOcrTextFromCloudinary = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Extracts OCR text from a document stored in Cloudinary.
 * This service now integrates with the enhanced OCR system as a fallback option.
 * In production, this would use the Cloudinary SDK and their OCR add-on.
 *
 * @param publicId - The Cloudinary public ID of the uploaded document
 * @returns Promise<string> - The extracted text from the document
 */
const getOcrTextFromCloudinary = async (publicId) => {
    logger_1.default.info(`Extracting OCR text for Cloudinary ID: ${publicId}`);
    try {
        // MOCK LOGIC: Simulate an API call to Cloudinary's OCR add-on
        // In production, you would:
        // 1. Use Cloudinary SDK to call their OCR API
        // 2. Handle authentication with your Cloudinary credentials
        // 3. Process the response to extract the text
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate network delay
        // Mock OCR result - in reality this would come from Cloudinary's OCR service
        const mockOcrText = `This is the extracted text from the document with public ID ${publicId}.
The main allegation is undue favoritism in the procurement process.
The officer has been accused of showing preferential treatment to certain vendors.
Evidence suggests that the bidding process was not conducted fairly.
The defence argues that all procedures were followed according to established guidelines.
Supporting documents include procurement records, vendor communications, and audit reports.`;
        logger_1.default.info(`Cloudinary OCR text extraction completed for ${publicId}`);
        return mockOcrText;
    }
    catch (error) {
        logger_1.default.error(`Failed to extract OCR text from Cloudinary for ${publicId}:`, error);
        throw new Error(`Cloudinary OCR extraction failed for document ${publicId}`);
    }
};
exports.getOcrTextFromCloudinary = getOcrTextFromCloudinary;
/**
 * Enhanced OCR extraction that uses the new OCR orchestrator system
 * This is the recommended method for new implementations
 *
 * @param publicId - The Cloudinary public ID of the uploaded document
 * @param options - OCR processing options
 * @returns Promise<{text: string, metadata: any}> - The extracted text with metadata
 */
const getEnhancedOcrText = async (publicId, options = {}) => {
    logger_1.default.info(`Starting enhanced OCR extraction for Cloudinary ID: ${publicId}`);
    try {
        // Import OCR orchestrator dynamically to avoid circular dependencies
        const { ocrOrchestrator } = await Promise.resolve().then(() => __importStar(require("./ocr")));
        const defaultOptions = {
            enablePdfExtraction: true,
            enableTesseractOcr: true,
            enableCloudinaryFallback: true,
            timeout: 30000,
            retryAttempts: 2,
            ...options,
        };
        const ocrResult = await ocrOrchestrator.extractText(publicId, defaultOptions);
        logger_1.default.info(`Enhanced OCR extraction completed for ${publicId}`, {
            method: ocrResult.method,
            confidence: ocrResult.confidence,
            textLength: ocrResult.text.length,
            processingTime: ocrResult.processingTime,
        });
        return {
            text: ocrResult.text,
            metadata: {
                method: ocrResult.method,
                confidence: ocrResult.confidence,
                processingTime: ocrResult.processingTime,
                ...ocrResult.metadata,
            },
        };
    }
    catch (error) {
        logger_1.default.error(`Enhanced OCR extraction failed for ${publicId}:`, error);
        // Fallback to original Cloudinary OCR if enhanced system fails
        logger_1.default.info(`Falling back to original Cloudinary OCR for ${publicId}`);
        try {
            const fallbackText = await (0, exports.getOcrTextFromCloudinary)(publicId);
            return {
                text: fallbackText,
                metadata: {
                    method: "cloudinary-fallback",
                    confidence: 0.8,
                    processingTime: 2000,
                    fallbackUsed: true,
                },
            };
        }
        catch (fallbackError) {
            logger_1.default.error(`Both enhanced and fallback OCR failed for ${publicId}:`, fallbackError);
            throw new Error(`All OCR methods failed for document ${publicId}`);
        }
    }
};
exports.getEnhancedOcrText = getEnhancedOcrText;
//# sourceMappingURL=cloudinary.service.js.map