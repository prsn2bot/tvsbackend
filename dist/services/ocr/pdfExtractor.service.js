"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfExtractor = exports.PdfExtractorService = void 0;
const errorHandling_1 = require("./utils/errorHandling");
const ocrUtils_1 = require("./utils/ocrUtils");
const logger_1 = __importDefault(require("../../utils/logger"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const os_1 = __importDefault(require("os"));
// Import pdf-parse with any type to avoid TypeScript errors
const pdfParse = require("pdf-parse");
class PdfExtractorService {
    constructor() {
        this.method = "pdf-extraction";
    }
    /**
     * Extract text from PDF using pdf-parse library
     */
    async extractTextFromPdf(filePath) {
        try {
            logger_1.default.info(`Extracting text from PDF: ${filePath}`);
            const dataBuffer = await fs_1.default.promises.readFile(filePath);
            const pdfData = await pdfParse(dataBuffer);
            const sanitizedText = (0, ocrUtils_1.sanitizeExtractedText)(pdfData.text || "");
            logger_1.default.info(`PDF text extraction completed: ${sanitizedText.length} characters from ${pdfData.numpages || 0} pages`);
            const result = {
                text: sanitizedText,
                pageCount: pdfData.numpages || 0,
                hasSelectableText: sanitizedText.length > 0,
                extractionMethod: "native-text",
            };
            return result;
        }
        catch (error) {
            logger_1.default.error(`PDF text extraction failed: ${error}`);
            throw new errorHandling_1.EnhancedOcrError(`Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`, this.method, errorHandling_1.OCR_ERROR_CODES.PROCESSING_FAILED, undefined, error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Extracts text from a PDF document
     */
    async extractText(filePathOrUrl, options = {}) {
        const startTime = Date.now();
        return (0, errorHandling_1.withErrorHandling)(async () => {
            logger_1.default.info(`Starting PDF text extraction for: ${filePathOrUrl}`);
            let tempFile = null;
            try {
                let actualFilePath = filePathOrUrl;
                // If it's a URL, download it first
                if (this.isUrl(filePathOrUrl)) {
                    tempFile = await this.downloadFile(filePathOrUrl);
                    actualFilePath = tempFile;
                    logger_1.default.info(`Downloaded file from URL to: ${tempFile}`);
                }
                // Extract text using pdf-parse
                const result = await this.extractTextFromPdf(actualFilePath);
                const processingTime = Date.now() - startTime;
                logger_1.default.info(`PDF extraction completed in ${processingTime}ms`);
                return result;
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
            // Set maximum file size (20MB)
            const maxFileSize = 20 * 1024 * 1024;
            let downloadedBytes = 0;
            const request = client.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
                    return;
                }
                // Check content length if provided
                const contentLength = parseInt(response.headers["content-length"] || "0");
                if (contentLength > maxFileSize) {
                    reject(new Error(`File too large: ${contentLength} bytes (max: ${maxFileSize})`));
                    return;
                }
                response.on("data", (chunk) => {
                    downloadedBytes += chunk.length;
                    if (downloadedBytes > maxFileSize) {
                        request.destroy();
                        fs_1.default.unlink(tempFilePath, () => { });
                        reject(new Error(`File too large: exceeded ${maxFileSize} bytes`));
                        return;
                    }
                });
                response.pipe(file);
                file.on("finish", () => {
                    file.close();
                    logger_1.default.info(`File downloaded successfully to: ${tempFilePath} (${downloadedBytes} bytes)`);
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
     * Check if PDF has selectable text (for backward compatibility with tests)
     */
    async hasSelectableText(filePath) {
        try {
            const result = await this.extractText(filePath);
            return result.hasSelectableText;
        }
        catch (error) {
            logger_1.default.error(`Failed to check selectable text: ${error}`);
            return false;
        }
    }
    /**
     * Get PDF info (for backward compatibility with tests)
     */
    async getPdfInfo(filePath) {
        try {
            const result = await this.extractText(filePath);
            const stats = await fs_1.default.promises.stat(filePath);
            return {
                numPages: result.pageCount,
                hasSelectableText: result.hasSelectableText,
                fileSize: stats.size,
                // pdf-parse doesn't provide metadata, so we'll return undefined for these
                title: undefined,
                author: undefined,
                creationDate: undefined,
            };
        }
        catch (error) {
            logger_1.default.error(`Failed to get PDF info: ${error}`);
            throw error;
        }
    }
}
exports.PdfExtractorService = PdfExtractorService;
// Export singleton instance
exports.pdfExtractor = new PdfExtractorService();
//# sourceMappingURL=pdfExtractor.service.js.map