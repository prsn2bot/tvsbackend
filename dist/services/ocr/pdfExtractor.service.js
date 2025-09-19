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
exports.pdfExtractor = exports.PdfExtractorService = void 0;
const canvas_1 = require("canvas");
const errorHandling_1 = require("./utils/errorHandling");
const ocrUtils_1 = require("./utils/ocrUtils");
const logger_1 = __importDefault(require("../../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const os_1 = __importDefault(require("os"));
// PDF.js will be imported dynamically to avoid ES module issues
let pdfjs = null;
class PdfExtractorService {
    constructor() {
        this.method = "pdf-extraction";
    }
    /**
     * Initialize PDF.js dynamically to avoid ES module issues
     */
    async initializePdfjs() {
        if (!pdfjs) {
            try {
                pdfjs = await Promise.resolve().then(() => __importStar(require("pdfjs-dist")));
                // Configure PDF.js worker
                pdfjs.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.js");
                logger_1.default.debug("PDF.js initialized successfully");
            }
            catch (error) {
                logger_1.default.error("Failed to initialize PDF.js:", error);
                throw new errorHandling_1.EnhancedOcrError("Failed to initialize PDF.js library", this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, undefined, error instanceof Error ? error : new Error(String(error)));
            }
        }
        return pdfjs;
    }
    /**
     * Extracts text from a PDF document
     */
    async extractText(filePathOrUrl, options = {}) {
        const startTime = Date.now();
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Starting PDF text extraction for: ${filePathOrUrl}`);
            // Handle both local files and URLs
            const filePath = await this.resolveFilePath(filePathOrUrl);
            let tempFile = null;
            try {
                // If it's a URL, download it first
                if (this.isUrl(filePathOrUrl)) {
                    tempFile = await this.downloadFile(filePathOrUrl);
                    logger_1.default.info(`Downloaded file from URL to: ${tempFile}`);
                }
                const actualFilePath = tempFile || filePath;
                // Validate file exists and is accessible
                await this.validateFile(actualFilePath);
                // Load PDF document
                const pdfDocument = await this.loadPdfDocument(actualFilePath);
                try {
                    // First attempt: Extract native text
                    const nativeTextResult = await this.extractNativeText(pdfDocument, options);
                    // Check if native text extraction was successful
                    const quality = (0, ocrUtils_1.assessTextQuality)(nativeTextResult.text);
                    const hasGoodQuality = quality.estimatedAccuracy >= (options.qualityThreshold || 0.5);
                    if (nativeTextResult.text.length > 10 && hasGoodQuality) {
                        logger_1.default.info(`PDF native text extraction successful: ${nativeTextResult.text.length} characters`);
                        return {
                            ...nativeTextResult,
                            extractionMethod: "native-text",
                        };
                    }
                    // Fallback: Render pages and extract text if enabled
                    if (options.enableFallbackRendering &&
                        nativeTextResult.text.length < 50) {
                        logger_1.default.info("Native text extraction yielded minimal results, attempting rendered text extraction");
                        const renderedTextResult = await this.extractRenderedText(pdfDocument, options);
                        return {
                            ...renderedTextResult,
                            extractionMethod: "rendered-text",
                        };
                    }
                    // Return native text even if quality is low
                    return {
                        ...nativeTextResult,
                        extractionMethod: "native-text",
                    };
                }
                finally {
                    // Clean up PDF document
                    await pdfDocument.destroy();
                }
            }
            finally {
                // Clean up temporary file if it was downloaded
                if (tempFile) {
                    try {
                        await fs_1.default.promises.unlink(tempFile);
                        logger_1.default.debug(`Cleaned up temporary file: ${tempFile}`);
                    }
                    catch (cleanupError) {
                        logger_1.default.warn(`Failed to clean up temporary file: ${tempFile}`, cleanupError);
                    }
                }
            }
        }, this.method, { filePath: filePathOrUrl, processingTime: Date.now() - startTime });
    }
    /**
     * Checks if the input is a URL
     */
    isUrl(input) {
        return input.startsWith("http://") || input.startsWith("https://");
    }
    /**
     * Resolves file path - returns as-is for local files, or prepares for URL download
     */
    async resolveFilePath(input) {
        if (this.isUrl(input)) {
            return input; // Will be handled by downloadFile
        }
        return input;
    }
    /**
     * Downloads a file from URL to a temporary location
     */
    async downloadFile(url) {
        return new Promise((resolve, reject) => {
            const tempDir = os_1.default.tmpdir();
            const tempFileName = `pdf_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}.pdf`;
            const tempFilePath = path_1.default.join(tempDir, tempFileName);
            const file = fs_1.default.createWriteStream(tempFilePath);
            const client = url.startsWith("https://") ? https_1.default : http_1.default;
            logger_1.default.info(`Downloading file from URL: ${url}`);
            const request = client.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
                    return;
                }
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    logger_1.default.info(`File downloaded successfully to: ${tempFilePath}`);
                    resolve(tempFilePath);
                });
                file.on("error", (error) => {
                    fs_1.default.unlink(tempFilePath, () => { }); // Clean up on error
                    reject(error);
                });
            });
            request.on("error", (error) => {
                fs_1.default.unlink(tempFilePath, () => { }); // Clean up on error
                reject(error);
            });
            request.setTimeout(30000, () => {
                request.destroy();
                fs_1.default.unlink(tempFilePath, () => { }); // Clean up on timeout
                reject(new Error("Download timeout"));
            });
        });
    }
    /**
     * Validates that the PDF file exists and is accessible
     */
    async validateFile(filePath) {
        try {
            const stats = await fs_1.default.promises.stat(filePath);
            if (!stats.isFile()) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.FILE_NOT_FOUND, filePath);
            }
            // Check file size (max 50MB for PDF extraction)
            const maxSize = 50 * 1024 * 1024; // 50MB
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
            const pdfjsLib = await this.initializePdfjs();
            const data = await fs_1.default.promises.readFile(filePath);
            const loadingTask = pdfjsLib.getDocument({
                data: data,
                useSystemFonts: true,
                disableFontFace: false,
                verbosity: 0, // Reduce logging
            });
            const pdfDocument = await loadingTask.promise;
            logger_1.default.info(`PDF loaded successfully: ${pdfDocument.numPages} pages`);
            return pdfDocument;
        }
        catch (error) {
            logger_1.default.error(`Failed to load PDF document: ${filePath}`, error);
            if (error instanceof Error && error.message.includes("Invalid PDF")) {
                throw errorHandling_1.OcrErrorFactory.createFileError(this.method, errorHandling_1.OCR_ERROR_CODES.CORRUPTED_FILE, filePath, error);
            }
            throw errorHandling_1.OcrErrorFactory.createProcessingError(this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, { filePath }, error);
        }
    }
    /**
     * Extracts native text content from PDF pages
     */
    async extractNativeText(pdfDocument, options = {}) {
        const maxPages = Math.min(options.maxPages || pdfDocument.numPages, pdfDocument.numPages);
        const textParts = [];
        let hasSelectableText = false;
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
                const page = await pdfDocument.getPage(pageNum);
                const textContent = await page.getTextContent();
                // Extract text items
                const pageText = textContent.items
                    .map((item) => {
                    if ("str" in item) {
                        return item.str;
                    }
                    return "";
                })
                    .join(" ");
                if (pageText.trim().length > 0) {
                    hasSelectableText = true;
                    textParts.push(pageText);
                }
                // Clean up page
                page.cleanup();
            }
            catch (error) {
                logger_1.default.warn(`Failed to extract text from page ${pageNum}:`, error);
                // Continue with other pages
            }
        }
        const fullText = (0, ocrUtils_1.sanitizeExtractedText)(textParts.join("\n\n"));
        return {
            text: fullText,
            pageCount: pdfDocument.numPages,
            hasSelectableText,
        };
    }
    /**
     * Renders PDF pages to canvas and extracts text (for scanned PDFs)
     */
    async extractRenderedText(pdfDocument, options = {}) {
        const maxPages = Math.min(options.maxPages || 5, pdfDocument.numPages); // Limit rendered pages
        const textParts = [];
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            try {
                const page = await pdfDocument.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
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
                // Convert canvas to image data for OCR
                // Note: This would typically be passed to Tesseract.js
                // For now, we'll return a placeholder indicating rendered extraction
                textParts.push(`[Rendered page ${pageNum} - requires Tesseract OCR]`);
                // Clean up
                page.cleanup();
            }
            catch (error) {
                logger_1.default.warn(`Failed to render page ${pageNum}:`, error);
            }
        }
        return {
            text: textParts.join("\n\n"),
            pageCount: pdfDocument.numPages,
            hasSelectableText: false,
        };
    }
    /**
     * Checks if a PDF has selectable text content
     */
    async hasSelectableText(filePath) {
        return (0, errorHandling_1.withErrorHandling)(async () => {
            await this.validateFile(filePath);
            const pdfDocument = await this.loadPdfDocument(filePath);
            try {
                // Check first few pages for text content
                const pagesToCheck = Math.min(3, pdfDocument.numPages);
                for (let pageNum = 1; pageNum <= pagesToCheck; pageNum++) {
                    const page = await pdfDocument.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const hasText = textContent.items.some((item) => "str" in item && item.str.trim().length > 0);
                    page.cleanup();
                    if (hasText) {
                        return true;
                    }
                }
                return false;
            }
            finally {
                await pdfDocument.destroy();
            }
        }, this.method, { filePath });
    }
    /**
     * Gets PDF metadata and basic information
     */
    async getPdfInfo(filePath) {
        return (0, errorHandling_1.withErrorHandling)(async () => {
            await this.validateFile(filePath);
            const stats = await fs_1.default.promises.stat(filePath);
            const pdfDocument = await this.loadPdfDocument(filePath);
            try {
                const metadata = await pdfDocument.getMetadata();
                const hasText = await this.hasSelectableText(filePath);
                return {
                    numPages: pdfDocument.numPages,
                    hasSelectableText: hasText,
                    fileSize: stats.size,
                    title: metadata.info?.Title,
                    author: metadata.info?.Author,
                    creationDate: metadata.info?.CreationDate
                        ? new Date(metadata.info.CreationDate)
                        : undefined,
                };
            }
            finally {
                await pdfDocument.destroy();
            }
        }, this.method, { filePath });
    }
}
exports.PdfExtractorService = PdfExtractorService;
// Export singleton instance
exports.pdfExtractor = new PdfExtractorService();
//# sourceMappingURL=pdfExtractor.service.js.map