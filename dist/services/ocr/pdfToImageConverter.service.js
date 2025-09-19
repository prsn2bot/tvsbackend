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
exports.pdfToImageConverter = exports.PdfToImageConverter = void 0;
const pdfjs = __importStar(require("pdfjs-dist"));
const canvas_1 = require("canvas");
const errorHandling_1 = require("./utils/errorHandling");
const ocrConfig_1 = require("./ocrConfig");
const logger_1 = __importDefault(require("../../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.js");
class PdfToImageConverter {
    constructor() {
        this.method = "pdf-extraction";
    }
    /**
     * Converts PDF pages to image buffers for OCR processing
     */
    async convertPdfToImages(filePath, options = {}) {
        const startTime = Date.now();
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Starting PDF to image conversion: ${filePath}`);
            // Validate file
            await this.validateFile(filePath);
            const stats = await fs_1.default.promises.stat(filePath);
            // Load PDF document
            const pdfDocument = await this.loadPdfDocument(filePath);
            try {
                const config = ocrConfig_1.ocrConfig.getConfiguration();
                const conversionOptions = {
                    dpi: options.dpi || config.pdf_render_dpi || 150,
                    format: options.format || "png",
                    quality: options.quality || 0.9,
                    maxPages: options.maxPages || pdfDocument.numPages,
                    startPage: options.startPage || 1,
                    endPage: options.endPage || pdfDocument.numPages,
                };
                // Validate page range
                const startPage = Math.max(1, conversionOptions.startPage);
                const endPage = Math.min(pdfDocument.numPages, conversionOptions.endPage, startPage + conversionOptions.maxPages - 1);
                logger_1.default.info(`Converting pages ${startPage} to ${endPage} at ${conversionOptions.dpi} DPI`);
                const convertedPages = [];
                for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                    try {
                        const convertedPage = await this.convertSinglePage(pdfDocument, pageNum, conversionOptions);
                        convertedPages.push(convertedPage);
                        logger_1.default.debug(`Converted page ${pageNum}/${endPage}`);
                    }
                    catch (error) {
                        logger_1.default.warn(`Failed to convert page ${pageNum}:`, error);
                        // Continue with other pages
                    }
                }
                if (convertedPages.length === 0) {
                    throw errorHandling_1.OcrErrorFactory.createProcessingError(this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, { filePath, reason: "No pages could be converted" });
                }
                const processingTime = Date.now() - startTime;
                logger_1.default.info(`PDF conversion completed: ${convertedPages.length} pages in ${processingTime}ms`);
                return {
                    pages: convertedPages,
                    totalPages: pdfDocument.numPages,
                    processingTime,
                    originalFileSize: stats.size,
                };
            }
            finally {
                await pdfDocument.destroy();
            }
        }, this.method, { filePath });
    }
    /**
     * Converts a single PDF page to image buffer
     */
    async convertSinglePage(pdfDocument, pageNumber, options) {
        const page = await pdfDocument.getPage(pageNumber);
        try {
            // Calculate scale based on DPI
            const scale = options.dpi / 72; // 72 DPI is the default
            const viewport = page.getViewport({ scale });
            // Create canvas
            const canvas = (0, canvas_1.createCanvas)(viewport.width, viewport.height);
            const context = canvas.getContext("2d");
            // Render page to canvas
            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
            };
            await page.render(renderContext).promise;
            // Convert canvas to buffer
            let imageBuffer;
            if (options.format === "jpeg") {
                imageBuffer = canvas.toBuffer("image/jpeg", {
                    quality: options.quality,
                });
            }
            else {
                imageBuffer = canvas.toBuffer("image/png");
            }
            return {
                pageNumber,
                imageBuffer,
                width: viewport.width,
                height: viewport.height,
                format: options.format,
            };
        }
        finally {
            page.cleanup();
        }
    }
    /**
     * Converts PDF to images and saves them to disk
     */
    async convertAndSaveImages(filePath, outputDir, options = {}) {
        return (0, errorHandling_1.withErrorHandling)(async () => {
            // Create output directory if needed
            if (options.createOutputDir && !fs_1.default.existsSync(outputDir)) {
                await fs_1.default.promises.mkdir(outputDir, { recursive: true });
            }
            // Convert PDF to images
            const conversionResult = await this.convertPdfToImages(filePath, options);
            // Save images to disk
            const savedFiles = [];
            const filenamePrefix = options.filenamePrefix || path_1.default.basename(filePath, ".pdf");
            const extension = options.format === "jpeg" ? "jpg" : "png";
            for (const page of conversionResult.pages) {
                const filename = `${filenamePrefix}_page_${page.pageNumber
                    .toString()
                    .padStart(3, "0")}.${extension}`;
                const outputPath = path_1.default.join(outputDir, filename);
                await fs_1.default.promises.writeFile(outputPath, page.imageBuffer);
                savedFiles.push(outputPath);
                logger_1.default.debug(`Saved page ${page.pageNumber} to ${outputPath}`);
            }
            logger_1.default.info(`Saved ${savedFiles.length} images to ${outputDir}`);
            return {
                savedFiles,
                conversionResult,
            };
        }, this.method, { filePath, outputDir });
    }
    /**
     * Converts specific PDF pages to images with memory optimization
     */
    async convertPagesStreaming(filePath, pageNumbers, options = {}) {
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Converting specific pages: ${pageNumbers.join(", ")}`);
            await this.validateFile(filePath);
            const pdfDocument = await this.loadPdfDocument(filePath);
            try {
                const config = ocrConfig_1.ocrConfig.getConfiguration();
                const conversionOptions = {
                    dpi: options.dpi || config.pdf_render_dpi || 150,
                    format: options.format || "png",
                    quality: options.quality || 0.9,
                };
                const convertedPages = [];
                // Process pages one by one to optimize memory usage
                for (const pageNum of pageNumbers) {
                    if (pageNum < 1 || pageNum > pdfDocument.numPages) {
                        logger_1.default.warn(`Skipping invalid page number: ${pageNum}`);
                        continue;
                    }
                    try {
                        const convertedPage = await this.convertSinglePage(pdfDocument, pageNum, conversionOptions);
                        convertedPages.push(convertedPage);
                        logger_1.default.debug(`Converted page ${pageNum}`);
                    }
                    catch (error) {
                        logger_1.default.warn(`Failed to convert page ${pageNum}:`, error);
                    }
                }
                return convertedPages;
            }
            finally {
                await pdfDocument.destroy();
            }
        }, this.method, { filePath, pageNumbers });
    }
    /**
     * Gets optimal conversion settings based on PDF characteristics
     */
    async getOptimalConversionSettings(filePath) {
        return (0, errorHandling_1.withErrorHandling)(async () => {
            await this.validateFile(filePath);
            const stats = await fs_1.default.promises.stat(filePath);
            const pdfDocument = await this.loadPdfDocument(filePath);
            try {
                // Sample first page to get dimensions
                const firstPage = await pdfDocument.getPage(1);
                const viewport = firstPage.getViewport({ scale: 1 });
                firstPage.cleanup();
                // Calculate recommendations based on page size and document characteristics
                const pageArea = viewport.width * viewport.height;
                const isLargePage = pageArea > 500000; // Arbitrary threshold
                const isLargeDocument = pdfDocument.numPages > 20;
                let recommendedDpi = 150; // Default
                if (isLargePage || isLargeDocument) {
                    recommendedDpi = 120; // Lower DPI for large documents
                }
                else if (pageArea < 100000) {
                    recommendedDpi = 200; // Higher DPI for small pages
                }
                const recommendedFormat = isLargeDocument
                    ? "jpeg"
                    : "png";
                // Estimate memory usage (rough calculation)
                const bytesPerPixel = recommendedFormat === "png" ? 4 : 3;
                const scale = recommendedDpi / 72;
                const scaledWidth = viewport.width * scale;
                const scaledHeight = viewport.height * scale;
                const estimatedMemoryPerPage = scaledWidth * scaledHeight * bytesPerPixel;
                const estimatedMemoryUsage = estimatedMemoryPerPage * pdfDocument.numPages;
                // Estimate processing time (very rough)
                const baseTimePerPage = 1000; // 1 second base time
                const complexityFactor = Math.min(2, pageArea / 200000);
                const processingTimeEstimate = baseTimePerPage * complexityFactor * pdfDocument.numPages;
                return {
                    recommendedDpi,
                    recommendedFormat,
                    estimatedMemoryUsage,
                    processingTimeEstimate,
                };
            }
            finally {
                await pdfDocument.destroy();
            }
        }, this.method, { filePath });
    }
    /**
     * Validates PDF file for conversion
     */
    async validateFile(filePath) {
        try {
            const stats = await fs_1.default.promises.stat(filePath);
            if (!stats.isFile()) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.FILE_NOT_FOUND, filePath);
            }
            // Check file size (max 100MB for conversion)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (stats.size > maxSize) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.FILE_TOO_LARGE, filePath);
            }
            // Check file extension
            const ext = path_1.default.extname(filePath).toLowerCase();
            if (ext !== ".pdf") {
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
     * Loads PDF document using PDF.js
     */
    async loadPdfDocument(filePath) {
        try {
            const data = await fs_1.default.promises.readFile(filePath);
            const loadingTask = pdfjs.getDocument({
                data: data,
                useSystemFonts: true,
                disableFontFace: false,
                verbosity: 0,
            });
            const pdfDocument = await loadingTask.promise;
            logger_1.default.debug(`PDF loaded for conversion: ${pdfDocument.numPages} pages`);
            return pdfDocument;
        }
        catch (error) {
            logger_1.default.error(`Failed to load PDF for conversion: ${filePath}`, error);
            if (error instanceof Error && error.message.includes("Invalid PDF")) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.CORRUPTED_FILE, filePath, error);
            }
            throw errorHandling_1.OcrErrorFactory.createProcessingError(this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, { filePath }, error);
        }
    }
    /**
     * Cleans up temporary resources
     */
    async cleanup() {
        // No persistent resources to clean up in this implementation
        logger_1.default.debug("PDF to image converter cleanup completed");
    }
}
exports.PdfToImageConverter = PdfToImageConverter;
// Export singleton instance
exports.pdfToImageConverter = new PdfToImageConverter();
//# sourceMappingURL=pdfToImageConverter.service.js.map