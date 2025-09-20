import { PdfExtractionResult, OcrMethod } from "./types/ocr.types";
import {
  EnhancedOcrError,
  OcrErrorFactory,
  OCR_ERROR_CODES,
  withErrorHandling,
} from "./utils/errorHandling";
import { sanitizeExtractedText, assessTextQuality } from "./utils/ocrUtils";
import logger from "../../utils/logger";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import os from "os";

// Import pdf-parse with any type to avoid TypeScript errors
const pdfParse = require("pdf-parse");

export class PdfExtractorService {
  private readonly method: OcrMethod = "pdf-extraction";

  /**
   * Extract text from PDF using pdf-parse library
   */
  private async extractTextFromPdf(
    filePath: string
  ): Promise<PdfExtractionResult> {
    try {
      logger.info(`Extracting text from PDF: ${filePath}`);

      const dataBuffer = await fs.promises.readFile(filePath);
      const pdfData: any = await pdfParse(dataBuffer);

      const sanitizedText = sanitizeExtractedText(pdfData.text || "");

      logger.info(
        `PDF text extraction completed: ${
          sanitizedText.length
        } characters from ${pdfData.numpages || 0} pages`
      );

      const result: PdfExtractionResult = {
        text: sanitizedText,
        pageCount: pdfData.numpages || 0,
        hasSelectableText: sanitizedText.length > 0,
        extractionMethod: "native-text" as const,
      };

      return result;
    } catch (error) {
      logger.error(`PDF text extraction failed: ${error}`);
      throw new EnhancedOcrError(
        `Failed to extract text from PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        this.method,
        OCR_ERROR_CODES.PROCESSING_FAILED,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Extracts text from a PDF document
   */
  async extractText(
    filePathOrUrl: string,
    options: {
      maxPages?: number;
      qualityThreshold?: number;
      enableFallbackRendering?: boolean;
    } = {}
  ): Promise<PdfExtractionResult> {
    const startTime = Date.now();

    return withErrorHandling(
      async () => {
        logger.info(`Starting PDF text extraction for: ${filePathOrUrl}`);

        let tempFile: string | null = null;

        try {
          let actualFilePath = filePathOrUrl;

          // If it's a URL, download it first
          if (this.isUrl(filePathOrUrl)) {
            tempFile = await this.downloadFile(filePathOrUrl);
            actualFilePath = tempFile;
            logger.info(`Downloaded file from URL to: ${tempFile}`);
          }

          // Extract text using pdf-parse
          const result = await this.extractTextFromPdf(actualFilePath);

          const processingTime = Date.now() - startTime;
          logger.info(`PDF extraction completed in ${processingTime}ms`);

          return result;
        } finally {
          // Clean up temporary file if it was downloaded
          if (tempFile) {
            try {
              await fs.promises.unlink(tempFile);
              logger.debug(`Cleaned up temporary file: ${tempFile}`);
            } catch (cleanupError) {
              logger.warn(
                `Failed to clean up temporary file: ${tempFile}`,
                cleanupError
              );
            }
          }
        }
      },
      this.method,
      { filePath: filePathOrUrl, processingTime: Date.now() - startTime }
    );
  }

  /**
   * Checks if the input is a URL
   */
  private isUrl(input: string): boolean {
    return input.startsWith("http://") || input.startsWith("https://");
  }

  /**
   * Downloads a file from URL to a temporary location
   */
  private async downloadFile(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempDir = os.tmpdir();
      const tempFileName = `pdf_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.pdf`;
      const tempFilePath = path.join(tempDir, tempFileName);

      const file = fs.createWriteStream(tempFilePath);
      const client = url.startsWith("https://") ? https : http;

      logger.info(`Downloading file from URL: ${url}`);

      // Set maximum file size (20MB)
      const maxFileSize = 20 * 1024 * 1024;
      let downloadedBytes = 0;

      const request = client.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download file: HTTP ${response.statusCode}`)
          );
          return;
        }

        // Check content length if provided
        const contentLength = parseInt(
          response.headers["content-length"] || "0"
        );
        if (contentLength > maxFileSize) {
          reject(
            new Error(
              `File too large: ${contentLength} bytes (max: ${maxFileSize})`
            )
          );
          return;
        }

        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;
          if (downloadedBytes > maxFileSize) {
            request.destroy();
            fs.unlink(tempFilePath, () => {});
            reject(new Error(`File too large: exceeded ${maxFileSize} bytes`));
            return;
          }
        });

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          logger.info(
            `File downloaded successfully to: ${tempFilePath} (${downloadedBytes} bytes)`
          );
          resolve(tempFilePath);
        });

        file.on("error", (error) => {
          fs.unlink(tempFilePath, () => {}); // Clean up on error
          reject(error);
        });
      });

      request.on("error", (error) => {
        fs.unlink(tempFilePath, () => {}); // Clean up on error
        reject(error);
      });

      request.setTimeout(30000, () => {
        request.destroy();
        fs.unlink(tempFilePath, () => {}); // Clean up on timeout
        reject(new Error("Download timeout"));
      });
    });
  }

  /**
   * Check if PDF has selectable text (for backward compatibility with tests)
   */
  async hasSelectableText(filePath: string): Promise<boolean> {
    try {
      const result = await this.extractText(filePath);
      return result.hasSelectableText;
    } catch (error) {
      logger.error(`Failed to check selectable text: ${error}`);
      return false;
    }
  }

  /**
   * Get PDF info (for backward compatibility with tests)
   */
  async getPdfInfo(filePath: string): Promise<{
    numPages: number;
    hasSelectableText: boolean;
    fileSize: number;
    title?: string;
    author?: string;
    creationDate?: Date;
  }> {
    try {
      const result = await this.extractText(filePath);
      const stats = await fs.promises.stat(filePath);

      return {
        numPages: result.pageCount,
        hasSelectableText: result.hasSelectableText,
        fileSize: stats.size,
        // pdf-parse doesn't provide metadata, so we'll return undefined for these
        title: undefined,
        author: undefined,
        creationDate: undefined,
      };
    } catch (error) {
      logger.error(`Failed to get PDF info: ${error}`);
      throw error;
    }
  }
}

// Export singleton instance
export const pdfExtractor = new PdfExtractorService();
