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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrMetadataService = exports.pdfToImageConverter = exports.tesseractOcr = exports.pdfExtractor = exports.withErrorHandling = exports.OCR_ERROR_CODES = exports.ErrorRecovery = exports.OcrErrorFactory = exports.EnhancedOcrError = exports.ocrConfig = exports.OcrOrchestrator = exports.ocrOrchestrator = void 0;
// Main OCR services
var ocrOrchestrator_service_1 = require("./ocrOrchestrator.service");
Object.defineProperty(exports, "ocrOrchestrator", { enumerable: true, get: function () { return ocrOrchestrator_service_1.ocrOrchestrator; } });
Object.defineProperty(exports, "OcrOrchestrator", { enumerable: true, get: function () { return ocrOrchestrator_service_1.OcrOrchestrator; } });
var ocrConfig_1 = require("./ocrConfig");
Object.defineProperty(exports, "ocrConfig", { enumerable: true, get: function () { return ocrConfig_1.ocrConfig; } });
// Types
__exportStar(require("./types/ocr.types"), exports);
// Validation schemas
__exportStar(require("./types/validation.schemas"), exports);
// Utilities
__exportStar(require("./utils/ocrUtils"), exports);
var errorHandling_1 = require("./utils/errorHandling");
Object.defineProperty(exports, "EnhancedOcrError", { enumerable: true, get: function () { return errorHandling_1.EnhancedOcrError; } });
Object.defineProperty(exports, "OcrErrorFactory", { enumerable: true, get: function () { return errorHandling_1.OcrErrorFactory; } });
Object.defineProperty(exports, "ErrorRecovery", { enumerable: true, get: function () { return errorHandling_1.OcrErrorRecovery; } });
Object.defineProperty(exports, "OCR_ERROR_CODES", { enumerable: true, get: function () { return errorHandling_1.OCR_ERROR_CODES; } });
Object.defineProperty(exports, "withErrorHandling", { enumerable: true, get: function () { return errorHandling_1.withErrorHandling; } });
// Individual OCR services
var pdfExtractor_service_1 = require("./pdfExtractor.service");
Object.defineProperty(exports, "pdfExtractor", { enumerable: true, get: function () { return pdfExtractor_service_1.pdfExtractor; } });
var tesseractOcr_service_1 = require("./tesseractOcr.service");
Object.defineProperty(exports, "tesseractOcr", { enumerable: true, get: function () { return tesseractOcr_service_1.tesseractOcr; } });
var pdfToImageConverter_service_1 = require("./pdfToImageConverter.service");
Object.defineProperty(exports, "pdfToImageConverter", { enumerable: true, get: function () { return pdfToImageConverter_service_1.pdfToImageConverter; } });
var ocrMetadata_service_1 = require("./ocrMetadata.service");
Object.defineProperty(exports, "ocrMetadataService", { enumerable: true, get: function () { return ocrMetadata_service_1.ocrMetadataService; } });
//# sourceMappingURL=index.js.map